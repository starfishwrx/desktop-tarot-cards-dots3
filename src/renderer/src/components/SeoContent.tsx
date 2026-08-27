import { useLanguage } from '../context/LanguageContext'

export function SeoContent(): JSX.Element {
  const { language } = useLanguage()

  if (language === 'en') {
    return (
      <article className="seo-content" aria-labelledby="seo-title">
        <h2 id="seo-title">Free online tarot cards with AI interpretation</h2>
        <p>
          Starfish Tarot uses the complete 78-card Rider-Waite-Smith deck. Choose a love, career,
          money, general outlook or custom three-card spread, then explore upright and reversed
          meanings with an optional Dots AI synthesis.
        </p>
        <div className="seo-content__grid">
          <section>
            <h3>What the reading considers</h3>
            <p>
              Each reading connects spread positions, imagery, suits, elements, numbers,
              reversals and relationships between the three cards instead of listing isolated
              definitions.
            </p>
          </section>
          <section>
            <h3>Is Starfish Tarot free?</h3>
            <p>
              The web app and local card meanings are free. AI readings are also free with fair
              rate limits that keep the shared service reliable.
            </p>
          </section>
          <section>
            <h3>How is the AI reading generated?</h3>
            <p>
              The selected question, positions and card orientations are sent through a protected
              gateway to the Dots model. The API key is never exposed to the browser.
            </p>
          </section>
        </div>
        <p className="seo-content__note">
          Tarot is a reflective tool, not a fixed prediction or a substitute for medical, legal or
          financial advice. <a href="/tarot-guide.html">Read the tarot guide</a>.
        </p>
      </article>
    )
  }

  return (
    <article className="seo-content" aria-labelledby="seo-title">
      <h2 id="seo-title">免费在线塔罗牌与 AI 综合解读</h2>
      <p>
        海星塔罗使用完整 78 张 Rider-Waite-Smith
        塔罗牌。选择爱情、事业、财运、整体运势或自定义三牌牌阵，查看正逆位牌义，并可请小红书
        Dots AI 生成综合解读。
      </p>
      <div className="seo-content__grid">
        <section>
          <h3>解读会考虑什么？</h3>
          <p>
            系统会结合牌阵位置、牌面象征、花色、元素、数字、正逆位和三张牌之间的关系，而不是简单罗列单张牌义。
          </p>
        </section>
        <section>
          <h3>海星塔罗免费吗？</h3>
          <p>网页与本地牌义免费使用；AI 解读也免费，并设置合理的频率限制以保障共享服务稳定。</p>
        </section>
        <section>
          <h3>AI 解读如何生成？</h3>
          <p>
            用户选择的问题、牌阵位置与卡牌正逆位会通过受保护的网关发送给 Dots 模型，API
            密钥不会暴露给浏览器。
          </p>
        </section>
      </div>
      <p className="seo-content__note">
        塔罗用于观察模式与选择，不是固定预言，也不替代医疗、法律或财务专业意见。<a href="/tarot-guide.html">阅读塔罗指南</a>。
      </p>
    </article>
  )
}
