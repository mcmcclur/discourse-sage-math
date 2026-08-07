# frozen_string_literal: true

describe PrettyText do
  before { SiteSetting.discourse_sage_math_enabled = true }

  it "renders sage fenced code blocks as Sage cells" do
    cooked = PrettyText.cook("```sage\nf(x) = x^2\nplot(f(x), (x, -2, 2))\n```")

    expect(cooked).to match_html(<<~HTML)
      <div class="discourse-sage-math">
        <div class="discourse-sage-math__header">
          <span class="discourse-sage-math__title">SageMath</span>
        </div>
        <div class="discourse-sage-math__source">f(x) = x^2
      plot(f(x), (x, -2, 2))
      </div>
        <div class="discourse-sage-math__output"></div>
      </div>
    HTML
  end

  it "also renders sagemath fenced code blocks as Sage cells" do
    cooked = PrettyText.cook("```sagemath\n2 + 2\n```")

    expect(cooked).to include('class="discourse-sage-math"')
  end

  it "escapes HTML in Sage source" do
    cooked = PrettyText.cook("```sage\n<script>alert('xss')</script>\n```")

    expect(cooked).to include("&lt;script&gt;alert('xss')&lt;/script&gt;")
    expect(cooked).not_to include("<script>")
  end

  it "leaves sage fenced code blocks alone when disabled" do
    SiteSetting.discourse_sage_math_enabled = false

    cooked = PrettyText.cook("```sage\n2 + 2\n```")

    expect(cooked).to match_html(<<~HTML)
      <pre data-code-wrap="sage"><code class="lang-sage">2 + 2
      </code></pre>
    HTML
  end
end
