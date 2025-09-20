import OpenAI from 'openai'
import * as cheerio from 'cheerio'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

const logger = usePino()

interface GenerationConfig {
  model?: string
  temperature?: number
  seed?: number
}

export async function generateHTML(prompt: string, config: GenerationConfig = {}) {
  const openai = new OpenAI()

  const schema = z.object({
    title: z.string()
      .describe('The title of the page, 3 words max'),
    description: z.string()
      .describe('A short description of the page. 10 words max'),
    html: z.string()
      .describe('Valid HTML'),
  })

  const { model = 'gpt-4o-mini', temperature = 0.7, seed } = config

  logger.debug({ prompt, model, temperature, seed }, 'generating HTML')
  
  const completionOptions: any = {
    model,
    max_tokens: 5000,
    temperature,
    response_format: zodResponseFormat(schema, 'page'),
    messages: [
      {
        role: 'system',
        content: `
              You are a professional web developer creating high-quality HTML 
              pages. Generate a complete, well-designed webpage based on the 
              user's prompt.

              CONTENT REQUIREMENTS:

              - Length: Exactly 300-500 words (one screen worth of content)
              - Structure: 3-4 clear sections with proper semantic headings
              - Quality: Professional, informative, well-written content
              - Relevance: Stay strictly on-topic, provide actual value
              - Tone: Professional but engaging, appropriate for business use

              TECHNICAL REQUIREMENTS:

              - Valid HTML5 with DOCTYPE declaration
              - Semantic HTML structure: use <header>, <main>, <section>, <article> appropriately
              - TailwindCSS only - no custom CSS or inline styles
              - Responsive design that works on mobile and desktop
              - Accessibility: proper heading hierarchy (h1 → h2 → h3), alt tags for images
              - No JavaScript - static HTML only

              LINK REQUIREMENTS:

              - Include exactly 4-6 navigation links
              - Links must be logically related sub-topics of the main content
              - Each link should represent a natural next step in exploration
              - Use descriptive, actionable link text (not "click here")
              - Always use relative links: yes (href="/page"); no (href="https://example.com")
              - Don't use anchor tags: yes (href="/page"); no (href="#page")

              VISUAL DESIGN REQUIREMENTS:

              - Clean, professional appearance suitable for business
              - Good visual hierarchy with proper spacing (use Tailwind spacing classes)
              - Readable typography with appropriate font sizes
              - Consistent color scheme (use Tailwind color utilities)
              - Proper whitespace and layout using Tailwind grid/flex utilities
              - Not too flashy - aim for clean, modern design

              EXAMPLE STRUCTURE:

              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <title>Your Page Title</title>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body class="bg-gray-50 text-gray-900">
                  <header class="bg-white shadow-sm">
                      <div class="max-w-4xl mx-auto px-6 py-4">
                          <h1 class="text-3xl font-bold text-gray-900">Page Title</h1>
                      </div>
                  </header>
                  <main class="max-w-4xl mx-auto px-6 py-8">
                      <!-- Your content sections here -->
                  </main>
              </body>
              </html>

              Return a valid JSON object with the following fields:
              - title: The title of the page (3 words max)
              - description: A short description of the page (10 words max) 
              - html: Valid HTML content

              Example:
              {
                "title": "Page Title",
                "description": "A short description of the page",
                "html": "<html><body><h1>Page Title</h1><p>A short description of the page</p></body></html>"
              }
            `,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  }

  // Add seed if provided
  if (seed !== undefined) {
    completionOptions.seed = seed
  }

  const completion = await openai.chat.completions.parse(completionOptions)

  const html = completion.choices[0]?.message?.parsed as z.infer<typeof schema>
  if (!html) {
    logger.error('failed to parse OpenAI response')
    throw createError({ status: 500, message: 'Failed to generate HTML' })
  }
  logger.debug({ title: html.title }, 'HTML generated')
  return html
}

export async function processHTML(html: string): Promise<string> {
  const $ = cheerio.load(html)

  const bodyContent = $('body').html()
  if (!bodyContent) {
    logger.error('no body content in HTML')
    throw createError({ status: 500, message: 'Invalid HTML: no body content found' })
  }

  logger.debug('HTML processed')
  return bodyContent
}
