import {
  nestSpreadProperties,
  transformTailwindConfig,
  unnestSpreadProperties,
} from "@/src/utils/initializers/initialize-tailwind-config"
import { Project, SyntaxKind } from "ts-morph"
import { beforeEach, describe, expect, test } from "vitest"

const SHARED_CONFIG = {
  $schema: "https://ui.shadcn.com/schema.json",
  style: "new-york",
  rsc: true,
  tsx: true,
  tailwind: {
    config: "tailwind.config.ts",
    css: "app/globals.css",
    baseColor: "slate",
    cssVariables: true,
  },
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
  },
  resolvedPaths: {
    cwd: ".",
    tailwindConfig: "tailwind.config.ts",
    tailwindCss: "app/globals.css",
    components: "./components",
    utils: "./lib/utils",
    ui: "./components/ui",
  },
}

describe("transformTailwindConfig -> darkMode property", () => {
  test("should add darkMode property if not in config", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}
export default config
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()

    expect(
      await transformTailwindConfig(
        `/** @type {import('tailwindcss').Config} */

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [],
}
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()

    expect(
      await transformTailwindConfig(
        `/** @type {import('tailwindcss').Config} */
const foo = {
  bar: 'baz',
}

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [],
}
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should append class to darkMode property if existing array", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["selector"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}
export default config
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should preserve quote kind", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['selector', '[data-mode="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}
export default config
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should convert string to array and add class if darkMode is string", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "selector",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}
export default config
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should work with multiple darkMode selectors", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['variant', [
    '@media (prefers-color-scheme: dark) { &:not(.light *) }',
    '&:is(.dark *)',
  ]],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}
export default config
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should not add darkMode property if already in config", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}
export default config
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()

    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

  const config: Config = {
  darkMode: ['class', 'selector'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
  }
  export default config
  `,
        {
          properties: [
            {
              name: "darkMode",
              value: "class",
            },
          ],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })
})

describe("transformTailwindConfig -> plugin", () => {
  test("should add plugin if not in config", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
}
export default config
  `,
        {
          plugins: ["tailwindcss-animate"],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should append plugin to existing array", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
export default config
  `,
        {
          plugins: ["tailwindcss-animate"],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should not add plugin if already in config", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
}
export default config
  `,
        {
          plugins: ["tailwindcss-animate"],
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })
})

describe("transformTailwindConfig -> theme", () => {
  test("should add theme if not in config", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

  const config: Config = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  }
  export default config
    `,
        {
          theme: {
            extend: {
              colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                  DEFAULT: "hsl(var(--primary))",
                  foreground: "hsl(var(--primary-foreground))",
                },
              },
            },
          },
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should merge existing theme", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
}
export default config
  `,
        {
          theme: {
            extend: {
              colors: {
                primary: {
                  DEFAULT: "hsl(var(--primary))",
                  foreground: "hsl(var(--primary-foreground))",
                },
                card: {
                  DEFAULT: "hsl(var(--card))",
                  foreground: "hsl(var(--card-foreground))",
                },
              },
            },
          },
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should keep spread assignments", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...defaultColors,
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
}
export default config
  `,
        {
          theme: {
            extend: {
              colors: {
                primary: {
                  DEFAULT: "hsl(var(--primary))",
                  foreground: "hsl(var(--primary-foreground))",
                },
                card: {
                  DEFAULT: "hsl(var(--card))",
                  foreground: "hsl(var(--card-foreground))",
                },
              },
            },
          },
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })

  test("should handle multiple properties", async () => {
    expect(
      await transformTailwindConfig(
        `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
      colors: {
        ...defaultColors,
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      boxShadow: {
        ...defaultBoxShadow,
        "3xl": "0 35px 60px -15px rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        "3xl": "2rem",
      },
      animation: {
        ...defaultAnimation,
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
}
export default config
  `,
        {
          theme: {
            extend: {
              fontFamily: {
                heading: ["var(--font-geist-sans)"],
              },
              colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                primary: {
                  DEFAULT: "hsl(var(--primary))",
                  foreground: "hsl(var(--primary-foreground))",
                },
                card: {
                  DEFAULT: "hsl(var(--card))",
                  foreground: "hsl(var(--card-foreground))",
                },
              },
              borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
              },
              animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
              },
            },
          },
        },
        {
          config: SHARED_CONFIG,
        }
      )
    ).toMatchSnapshot()
  })
})

describe("nestSpreadProperties", () => {
  let project: Project

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true })
  })

  function testTransformation(input: string, expected: string) {
    const sourceFile = project.createSourceFile(
      "test.ts",
      `const config = ${input};`
    )
    const configObject = sourceFile.getFirstDescendantByKind(
      SyntaxKind.ObjectLiteralExpression
    )
    if (!configObject) throw new Error("Config object not found")

    nestSpreadProperties(configObject)

    const result = configObject.getText()
    expect(result.replace(/\s+/g, "")).toBe(expected.replace(/\s+/g, ""))
  }

  test("should nest spread properties", () => {
    testTransformation(
      `{ theme: { ...foo, bar: { ...baz, one: "two" }, other: { a: "b", ...c } } }`,
      `{ theme: { ___foo: "...foo", bar: { ___baz: "...baz", one: "two" }, other: { a: "b", ___c: "...c" } } }`
    )
  })

  test("should handle mixed property assignments", () => {
    testTransformation(
      `{ ...foo, a: 1, b() {}, ...bar, c: { ...baz } }`,
      `{ ___foo: "...foo", a: 1, b() {}, ___bar: "...bar", c: { ___baz: "...baz" } }`
    )
  })

  test("should handle objects with only spread properties", () => {
    testTransformation(
      `{ ...foo, ...bar, ...baz }`,
      `{ ___foo: "...foo", ___bar: "...bar", ___baz: "...baz" }`
    )
  })

  test("should handle property name conflicts", () => {
    testTransformation(`{ foo: 1, ...foo }`, `{ foo: 1, ___foo: "...foo" }`)
  })

  test("should handle shorthand property names", () => {
    testTransformation(`{ a, ...foo, b }`, `{ a, ___foo: "...foo", b }`)
  })

  test("should handle computed property names", () => {
    testTransformation(
      `{ ["computed"]: 1, ...foo }`,
      `{ ["computed"]: 1, ___foo: "...foo" }`
    )
  })
})

describe("unnestSpreadProperties", () => {
  let project: Project

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true })
  })

  function testTransformation(input: string, expected: string) {
    const sourceFile = project.createSourceFile(
      "test.ts",
      `const config = ${input};`
    )
    const configObject = sourceFile.getFirstDescendantByKind(
      SyntaxKind.ObjectLiteralExpression
    )
    if (!configObject) throw new Error("Config object not found")

    unnestSpreadProperties(configObject)

    const result = configObject.getText()
    expect(result.replace(/\s+/g, "")).toBe(expected.replace(/\s+/g, ""))
  }

  test("should nest spread properties", () => {
    testTransformation(
      `{ theme: { ___foo: "...foo", bar: { ___baz: "...baz", one: "two" }, other: { a: "b", ___c: "...c" } } }`,
      `{ theme: { ...foo, bar: { ...baz, one: "two" }, other: { a: "b", ...c } } }`
    )
  })

  test("should handle mixed property assignments", () => {
    testTransformation(
      `{ ___foo: "...foo", a: 1, b() {}, ___bar: "...bar", c: { ___baz: "...baz" } }`,
      `{ ...foo, a: 1, b() {}, ...bar, c: { ...baz } }`
    )
  })

  test("should handle objects with only spread properties", () => {
    testTransformation(
      `{ ___foo: "...foo", ___bar: "...bar", ___baz: "...baz" }`,
      `{ ...foo, ...bar, ...baz }`
    )
  })

  test("should handle property name conflicts", () => {
    testTransformation(`{ foo: 1, ___foo: "...foo" }`, `{ foo: 1, ...foo }`)
  })

  test("should handle shorthand property names", () => {
    testTransformation(`{ a, ___foo: "...foo", b }`, `{ a, ...foo, b }`)
  })

  test("should handle computed property names", () => {
    testTransformation(
      `{ ["computed"]: 1, ___foo: "...foo" }`,
      `{ ["computed"]: 1, ...foo }`
    )
  })
})