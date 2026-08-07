const SAGE_LANGUAGES = new Set(["sage", "sagemath"]);

function languageFor(token) {
  return (token.info || "").trim().split(/\s+/)[0].toLowerCase();
}

function isSageFence(token) {
  return SAGE_LANGUAGES.has(languageFor(token));
}

function renderSageFence(md, token) {
  const escaped = md.utils.escapeHtml(token.content);

  return `
<div class="discourse-sage-math">
  <div class="discourse-sage-math__header">
    <span class="discourse-sage-math__title">SageMath</span>
  </div>
  <div class="discourse-sage-math__source">${escaped}</div>
  <div class="discourse-sage-math__output"></div>
</div>
`;
}

export function setup(helper) {
  if (!helper.markdownIt) {
    return;
  }

  helper.allowList([
    "div.discourse-sage-math",
    "div.discourse-sage-math__header",
    "span.discourse-sage-math__title",
    "div.discourse-sage-math__source",
    "div.discourse-sage-math__output",
  ]);

  helper.registerOptions((opts, siteSettings) => {
    opts.features.discourse_sage_math =
      siteSettings.discourse_sage_math_enabled;
  });

  helper.registerPlugin((md) => {
    if (!md.options.discourse.features.discourse_sage_math) {
      return;
    }

    const defaultFence =
      md.renderer.rules.fence ||
      ((tokens, idx, options, env, self) =>
        self.renderToken(tokens, idx, options));

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
      const token = tokens[idx];

      if (isSageFence(token)) {
        return renderSageFence(md, token);
      }

      return defaultFence(tokens, idx, options, env, self);
    };
  });
}
