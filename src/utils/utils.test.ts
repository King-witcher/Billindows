import { slugify } from './utils'

describe(slugify, () => {
  test('if it removes accents', () => {
    expect(slugify('ação')).toBe('acao')
    expect(slugify('coração')).toBe('coracao')
  })

  test('if it converts to lowercase', () => {
    expect(slugify('HelloWorld')).toBe('helloworld')
    expect(slugify('TypeScript')).toBe('typescript')
  })

  test('if it removes special characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld')
    expect(slugify('typescript#is$great%')).toBe('typescriptisgreat')
  })

  test('if it preserves hyphens and underscores', () => {
    expect(slugify('hello-world_test')).toBe('hello-world_test')
    expect(slugify('type_script-test')).toBe('type_script-test')
  })
})
