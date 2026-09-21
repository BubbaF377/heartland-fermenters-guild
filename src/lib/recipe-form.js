// Shared recipe-form logic used by both the admin add/edit form
// (src/pages/admin/index.astro) and the member submission form
// (src/pages/submit/index.astro), so the two don't duplicate the time-stage editor
// and field-reading logic. Client-side only (touches the DOM) — not imported from
// Astro frontmatter.
import {
  RECIPE_PREVIEW_STORAGE_KEY,
  TIME_STAGE_SUGGESTIONS,
  linesToPairs,
  pairsToLines,
  photoFileProblem,
} from './constants.js';

export function addStageRow(stagesList, label = '', value = '') {
  const row = document.createElement('div');
  row.className = 'stage-row';
  row.innerHTML = `
    <input type="text" class="stage-label" placeholder="Label (e.g. Prep)" value="${label.replace(/"/g, '&quot;')}" />
    <input type="text" class="stage-value" placeholder="Duration (e.g. 20 min)" value="${value.replace(/"/g, '&quot;')}" />
    <button type="button" class="secondary stage-remove" aria-label="Remove stage">&times;</button>
  `;
  row.querySelector('.stage-remove').addEventListener('click', () => row.remove());
  stagesList.append(row);
}

export function currentStagePairs(stagesList) {
  return [...stagesList.querySelectorAll('.stage-row')].map((row) => ({
    label: row.querySelector('.stage-label').value,
    value: row.querySelector('.stage-value').value,
  }));
}

// Wires the "+ Add stage" button and the category-based auto-populate behavior.
//
// Suggestions stay "live" — replaced on every category change — until the stage
// list is actually touched by the submitter (typing in a row, adding one, or
// removing one), at which point they lock and no further category change is
// allowed to overwrite what's there. This has to be tracked explicitly rather
// than inferred from "the list is non-empty": the category <select>'s first
// option (Beer) is already selected on page load with no "change" event ever
// firing for it, so suggestions are populated once up front too — if emptiness
// alone gated re-population, that initial fill would then block every
// subsequent category change from ever updating anything.
export function wireStageEditor({ stagesList, addStageButton, categorySelect }) {
  let touched = false;

  function markTouched() {
    touched = true;
  }

  function populateSuggestedStages() {
    if (touched) return;
    stagesList.innerHTML = '';
    const suggestions = TIME_STAGE_SUGGESTIONS[categorySelect.value] || [];
    suggestions.forEach((label) => addStageRow(stagesList, label));
  }

  addStageButton.addEventListener('click', () => {
    markTouched();
    addStageRow(stagesList);
  });

  categorySelect.addEventListener('change', populateSuggestedStages);

  // Any manual edit to a label/duration, or removing a row, counts as
  // "started customizing" — event delegation on the container catches these
  // regardless of how many rows exist or get added later.
  stagesList.addEventListener('input', markTouched);
  stagesList.addEventListener('click', (event) => {
    if (event.target.closest('.stage-remove')) markTouched();
  });

  populateSuggestedStages();

  // markTouched: for a caller that loads its own stage data outside this flow
  // (admin's Edit populates a recipe's actual stored stages) and needs category
  // changes to stop auto-replacing them, same as if the submitter had typed them.
  // reset: for a caller that clears the form back to a fresh "Add" state (admin's
  // Cancel, or the submit page after a successful submission) — un-locks and
  // re-populates for whatever category the reset form now shows.
  return {
    markTouched,
    reset() {
      touched = false;
      populateSuggestedStages();
    },
  };
}

// Reads every recipe field out of the form into a payload shaped to match a
// `recipes` document's fields directly (minus photo_path/status, which the
// caller supplies — creating vs. editing vs. a member submission each compute
// those differently).
export function collectRecipeFields(form, stagesList) {
  const formData = new FormData(form);
  return {
    title: String(formData.get('title') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    summary: String(formData.get('summary') || '').trim(),
    video_url: String(formData.get('video_url') || '').trim() || null,
    yield_text: String(formData.get('yield_text') || '').trim() || null,
    time_stages: pairsToLines(currentStagePairs(stagesList)) || null,
    ingredients: String(formData.get('ingredients') || '').trim(),
    instructions: String(formData.get('instructions') || '').trim(),
    notes: String(formData.get('notes') || '').trim() || null,
    submitted_by: String(formData.get('submitted_by') || '').trim() || null,
  };
}

// Populates a form (and its stage-editor rows) from an existing recipe — used
// by the admin's Edit action. There's no submission-page equivalent since a member
// only ever creates a fresh recipe, never edits an existing one.
export function populateRecipeForm(form, stagesList, recipe) {
  form.elements.title.value = recipe.title;
  form.elements.category.value = recipe.category;
  form.elements.summary.value = recipe.summary || '';
  form.elements.video_url.value = recipe.video_url || '';
  form.elements.yield_text.value = recipe.yield_text || '';
  form.elements.ingredients.value = recipe.ingredients || '';
  form.elements.instructions.value = recipe.instructions || '';
  form.elements.notes.value = recipe.notes || '';
  form.elements.submitted_by.value = recipe.submitted_by || '';

  stagesList.innerHTML = '';
  linesToPairs(recipe.time_stages).forEach(({ label, value }) => addStageRow(stagesList, label, value));
}

// Checks a photo the moment it's picked (type and size — see photoFileProblem),
// so a file storage.rules would refuse is explained up front rather than failing
// the whole save later. An unusable file is cleared from the input, so a submit
// can't carry it along by accident.
export function wirePhotoInput(photoInput, errorEl) {
  function showProblem(problem) {
    errorEl.textContent = problem || '';
    errorEl.hidden = !problem;
  }

  photoInput.addEventListener('change', () => {
    const problem = photoFileProblem(photoInput.files[0]);
    showProblem(problem);
    if (problem) photoInput.value = '';
  });

  photoInput.form?.addEventListener('reset', () => showProblem(null));
}

// Object URL for the photo in the most recent preview — kept so it can be
// released when the next preview replaces it.
let previewPhotoUrl = null;

// Opens /recipes/view?preview=1 in a tab showing exactly what's in the form right
// now, without saving anything: the real recipe page renders it, so the preview
// can't drift from what visitors will see. Re-previewing reuses the same tab.
//
// The recipe travels through localStorage (readable by the new tab, unlike
// sessionStorage). A newly chosen photo isn't uploaded — it's handed over as an
// object URL, which the preview tab can load for as long as this page stays
// open. When editing with no new photo chosen, `existingPhotoPath` shows the
// recipe's current one.
//
// Returns false if the browser won't allow localStorage (e.g. some private
// browsing modes), so the caller can say preview isn't available.
export function openRecipePreview({ form, stagesList, photoInput, existingPhotoPath = null, createdAt = null }) {
  const photoFile = photoInput.files[0] || null;

  if (previewPhotoUrl) URL.revokeObjectURL(previewPhotoUrl);
  previewPhotoUrl = photoFile ? URL.createObjectURL(photoFile) : null;

  const preview = {
    ...collectRecipeFields(form, stagesList),
    photo_preview_url: previewPhotoUrl,
    photo_path: photoFile ? null : existingPhotoPath,
    created_at: (createdAt || new Date()).toISOString(),
  };

  try {
    window.localStorage.setItem(RECIPE_PREVIEW_STORAGE_KEY, JSON.stringify(preview));
  } catch {
    return false;
  }
  window.open('/recipes/view?preview=1', 'hfg-recipe-preview');
  return true;
}
