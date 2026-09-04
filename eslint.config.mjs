// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // The simulation is a hot loop over typed arrays; `!` on indexed reads is
    // the alternative to a per-particle bounds check we already guarantee.
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
})
