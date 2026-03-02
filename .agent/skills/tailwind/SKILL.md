# Tailwind CSS v4 Documentation

## Introduction

Tailwind CSS v4 is a CSS-first utility framework that enables rapid UI development through a comprehensive set of pre-built utility classes. Unlike traditional CSS frameworks that require writing custom stylesheets, Tailwind provides low-level utility classes that can be composed directly in HTML markup to build any design. The framework uses a revolutionary CSS-native configuration approach where design tokens (colors, fonts, spacing, breakpoints) are defined using the `@theme` directive within standard CSS files, eliminating the need for JavaScript configuration files that were required in previous versions.

The core functionality of Tailwind CSS v4 centers around theme variables, responsive design utilities, state variants, and custom style extensions. Theme variables are defined in namespaces like `--color-*`, `--font-*`, `--spacing-*`, and `--breakpoint-*` that automatically generate corresponding utility classes. The framework includes built-in support for responsive breakpoints (sm, md, lg, xl, 2xl), container queries (@container, @sm, @md), dark mode theming, and comprehensive state variants (hover, focus, active, disabled, group-*, peer-*, has-*). Tailwind v4 compiles to optimized CSS that only includes the utilities actually used in your project.

## APIs and Key Functions

### @import Directive

The `@import` directive is used to inline import CSS files, including Tailwind itself. This is the entry point for using Tailwind CSS in any project and brings in the default theme, base styles, and utility classes.

```css
/* app.css */
@import "tailwindcss";

/* Import additional CSS files */
@import "./custom-styles.css";
@import "../packages/brand/theme.css";
```

### @theme Directive

The `@theme` directive defines custom design tokens (theme variables) that automatically generate corresponding utility classes. Variables are organized in namespaces that map to specific utility types like colors, fonts, spacing, and breakpoints.

```css
/* app.css */
@import "tailwindcss";

@theme {
  /* Custom colors - generates bg-brand, text-brand, etc. */
  --color-brand: oklch(0.72 0.11 178);
  --color-accent: oklch(0.84 0.18 117.33);

  /* Custom font - generates font-display utility */
  --font-display: "Satoshi", sans-serif;

  /* Custom breakpoint - generates 3xl: variant */
  --breakpoint-3xl: 120rem;

  /* Custom spacing multiplier */
  --spacing: 0.25rem;

  /* Custom animation with keyframes */
  --animate-fade-in: fade-in 0.3s ease-out;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

### @utility Directive

The `@utility` directive registers custom utility classes that work with all Tailwind variants like hover, focus, and responsive breakpoints. Custom utilities integrate seamlessly with the framework's variant system.

```css
/* app.css */
@import "tailwindcss";

@utility tab-4 {
  tab-size: 4;
}

@utility content-auto {
  content-visibility: auto;
}

@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

/* Usage in HTML: <pre class="tab-4 hover:tab-8 lg:tab-4"> */
```

### @variant Directive

The `@variant` directive applies Tailwind variants to custom CSS rules, allowing you to use the framework's state and responsive variants within your own stylesheets.

```css
/* app.css */
@import "tailwindcss";

.my-component {
  background: white;
  color: black;

  @variant hover {
    background: #f0f0f0;
  }

  @variant dark {
    background: #1a1a1a;
    color: white;
  }

  @variant md {
    padding: 2rem;
  }
}
```

### @custom-variant Directive

The `@custom-variant` directive creates new custom variants that can be used with any utility class. This enables theme-based styling, custom state selectors, and complex conditional styling patterns.

```css
/* app.css */
@import "tailwindcss";

/* Theme-based variant */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));

/* Custom state variant */
@custom-variant checked (&:checked);

/* Parent state variant */
@custom-variant sidebar-open (&:where([data-sidebar="open"] *));

/* Usage in HTML: <div class="theme-midnight:bg-slate-900 theme-midnight:text-white"> */
```

### @apply Directive

The `@apply` directive inlines existing utility classes into custom CSS rules, useful when styling third-party components or HTML you don't control while maintaining consistency with your design system.

```css
/* app.css */
@import "tailwindcss";

/* Style third-party components */
.select2-dropdown {
  @apply rounded-lg shadow-md bg-white;
}

.select2-search {
  @apply rounded border border-gray-300 px-3 py-2;
}

/* Typography components */
.prose h1 {
  @apply text-3xl font-bold text-gray-900 mb-4;
}

.prose p {
  @apply text-base text-gray-700 leading-relaxed;
}
```

### @reference Directive

The `@reference` directive imports a stylesheet for reference without including its styles in the output. This is essential for Vue/Svelte component styles and CSS modules where you need access to theme variables and custom utilities.

```html
<!-- Vue component -->
<template>
  <h1 class="title">Hello World</h1>
</template>

<style>
  @reference "../../app.css";

  .title {
    @apply text-2xl font-bold text-brand;
  }

  @variant hover {
    .title {
      @apply text-accent;
    }
  }
</style>
```

### @source Directive

The `@source` directive explicitly specifies source files for Tailwind's class detection when automatic content detection doesn't find them. This is useful for third-party UI libraries or dynamically generated class names.

```css
/* app.css */
@import "tailwindcss";

/* Include UI library components */
@source "../node_modules/@my-company/ui-lib";

/* Include dynamically loaded content */
@source "../content/**/*.html";

/* Safelist specific utilities */
@source inline("underline bg-red-500 text-white lg:flex");
```

### --alpha() Function

The `--alpha()` function adjusts the opacity of any color value, generating CSS color-mix() output for modern browser compatibility. It works with theme variables and arbitrary color values.

```css
/* app.css */
@import "tailwindcss";

.overlay {
  /* 50% opacity of lime-300 */
  background: --alpha(var(--color-lime-300) / 50%);
}

.glass-panel {
  /* 80% opacity of white */
  background: --alpha(#ffffff / 80%);
  backdrop-filter: blur(10px);
}

.shadow-colored {
  /* Semi-transparent brand color for shadow */
  box-shadow: 0 4px 20px --alpha(var(--color-brand) / 30%);
}
```

### --spacing() Function

The `--spacing()` function generates spacing values based on your theme's spacing multiplier. It integrates with calc() for computed spacing values and works in arbitrary values.

```css
/* app.css */
@import "tailwindcss";

@theme {
  --spacing: 0.25rem; /* 4px base */
}

.custom-card {
  /* 16px (4 * 4px) */
  padding: --spacing(4);

  /* Computed spacing with calc */
  margin-bottom: calc(--spacing(8) + 1px);
}

.inset-element {
  /* Negative spacing */
  margin-top: calc(--spacing(2) * -1);
}

/* HTML arbitrary value: <div class="py-[calc(--spacing(4)-1px)]"> */
```

### Responsive Breakpoint Variants

Tailwind provides mobile-first responsive variants that apply styles at specific viewport widths and above. Default breakpoints include sm (640px), md (768px), lg (1024px), xl (1280px), and 2xl (1536px).

```html
<!-- Responsive layout example -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
  <div class="p-4 md:p-6 lg:p-8">
    <h2 class="text-lg md:text-xl lg:text-2xl font-bold">Title</h2>
    <p class="text-sm md:text-base hidden sm:block">Description</p>
  </div>
</div>

<!-- Breakpoint ranges -->
<div class="md:max-xl:flex">Only flex between md and xl</div>

<!-- Custom breakpoints in theme -->
<div class="xs:text-left 3xl:grid-cols-8">Uses custom breakpoints</div>
```

### Container Query Variants

Container queries style elements based on parent container size instead of viewport. Use @container to mark a container and @sm, @md, etc. variants to apply conditional styles.

```html
<!-- Container query example -->
<div class="@container">
  <div class="flex flex-col @md:flex-row @lg:gap-8">
    <div class="@sm:w-1/3 @md:w-1/4">Sidebar</div>
    <div class="@sm:w-2/3 @md:w-3/4">Main content</div>
  </div>
</div>

<!-- Named containers for nested queries -->
<div class="@container/main">
  <div class="@container/sidebar">
    <div class="@sm/main:text-lg @md/sidebar:p-4">
      Responds to specific containers
    </div>
  </div>
</div>

<!-- Max-width container queries -->
<div class="@container">
  <div class="flex-row @max-md:flex-col">Stack on small containers</div>
</div>
```

### Dark Mode Variant

The dark variant enables dark mode styling via prefers-color-scheme media query or a custom selector. Configuration allows automatic system preference detection or manual toggle control.

```css
/* app.css - Custom dark mode selector */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

```html
<!-- Dark mode usage -->
<html class="dark">
  <body class="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
    <div class="border-gray-200 dark:border-gray-700">
      <h1 class="text-black dark:text-white">Adaptive Heading</h1>
      <button class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500">
        Click me
      </button>
    </div>
  </body>
</html>
```

### State Variants (hover, focus, active, etc.)

Tailwind provides comprehensive state variants for styling interactive elements. These include pseudo-classes (hover, focus, active), form states (disabled, checked, invalid), and structural selectors (first, last, odd, even).

```html
<!-- Interactive button with multiple states -->
<button class="
  bg-blue-500 text-white px-4 py-2 rounded-lg
  hover:bg-blue-600
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  active:bg-blue-700
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Submit
</button>

<!-- Form input with validation states -->
<input class="
  border border-gray-300 rounded px-3 py-2
  focus:border-blue-500 focus:ring-1 focus:ring-blue-500
  invalid:border-red-500 invalid:text-red-600
  placeholder:text-gray-400
" />

<!-- List with structural variants -->
<ul>
  <li class="py-2 first:pt-0 last:pb-0 odd:bg-gray-50 even:bg-white">Item</li>
</ul>
```

### Group and Peer Variants

Group variants (group-*) style elements based on parent state, while peer variants (peer-*) style elements based on sibling state. These enable complex interactive patterns without JavaScript.

```html
<!-- Group variant: style children based on parent hover -->
<div class="group rounded-lg p-6 hover:bg-blue-500">
  <h3 class="text-gray-900 group-hover:text-white">Card Title</h3>
  <p class="text-gray-600 group-hover:text-blue-100">Card description</p>
  <span class="opacity-0 group-hover:opacity-100 transition">Arrow →</span>
</div>

<!-- Named groups for nested contexts -->
<div class="group/card">
  <div class="group/button">
    <span class="group-hover/card:text-blue-500 group-hover/button:underline">
      Responds to specific parent
    </span>
  </div>
</div>

<!-- Peer variant: style based on sibling state -->
<div>
  <input type="checkbox" class="peer" />
  <label class="peer-checked:text-blue-500 peer-checked:font-bold">
    I change when checkbox is checked
  </label>
  <p class="hidden peer-checked:block">Shown when checked</p>
</div>
```

### Has Variant

The has-* variant styles an element based on its descendants, enabling parent styling based on child state using the CSS :has() selector.

```html
<!-- Style parent based on child state -->
<label class="has-[:checked]:bg-blue-50 has-[:checked]:ring-2 has-[:checked]:ring-blue-500 p-4 rounded-lg">
  <input type="checkbox" class="mr-2" />
  <span class="has-[:checked]:font-bold">Option with visual feedback</span>
</label>

<!-- Card that responds to focused input -->
<div class="has-[:focus]:ring-2 has-[:focus]:ring-blue-500 p-4 rounded-lg border">
  <input type="text" class="w-full border rounded px-3 py-2" placeholder="Focus me" />
</div>

<!-- Navigation highlighting -->
<nav class="has-[.active]:bg-gray-100">
  <a href="#" class="active">Current page</a>
  <a href="#">Other page</a>
</nav>
```

### Arbitrary Values and Variants

Arbitrary values allow one-off styles using bracket notation, while arbitrary variants enable custom selectors. These provide escape hatches for edge cases without modifying the theme.

```html
<!-- Arbitrary values for one-off styles -->
<div class="
  w-[327px]
  h-[calc(100vh-80px)]
  bg-[#1da1f2]
  text-[clamp(1rem,2vw,1.5rem)]
  grid-cols-[1fr_2fr_1fr]
  m-[var(--custom-margin)]
">
  Content with arbitrary values
</div>

<!-- Arbitrary variants for custom selectors -->
<div class="[&:nth-child(3)]:bg-blue-500">Third child styling</div>
<div class="[@supports(display:grid)]:grid">Feature query</div>
<div class="[@media(min-width:900px)]:flex">Custom media query</div>

<!-- Combining with other variants -->
<div class="hover:[&>svg]:scale-110">Hover scales child SVG</div>
<div class="dark:[&_.heading]:text-white">Dark mode for nested heading</div>
```

## Summary

Tailwind CSS v4 is designed for building modern web interfaces efficiently by composing utility classes directly in markup. Common use cases include creating responsive layouts that adapt from mobile to desktop using breakpoint variants (sm:, md:, lg:), implementing dark mode themes with the dark: variant, building interactive components with state variants (hover:, focus:, disabled:), and creating reusable component patterns using group-* and peer-* for parent/sibling state styling. The framework excels at rapid prototyping, design system implementation, and maintaining consistency across large applications through its theme variable system.

Integration with modern frontend tooling is seamless through the CSS-first approach. Tailwind v4 works with any build tool that processes CSS, including Vite, PostCSS, and the standalone CLI. For component frameworks like React, Vue, and Svelte, the @reference directive enables using theme variables and @apply within scoped styles without duplicating CSS output. The framework integrates with CSS modules, supports container queries for truly portable components, and generates optimized production builds that include only the utilities actually used in your project. Theme variables can be shared across projects via CSS imports, making it ideal for design systems and monorepo architectures.
