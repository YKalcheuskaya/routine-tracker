/** CSS build pipeline: Tailwind layers first, then browser vendor prefixes. */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
