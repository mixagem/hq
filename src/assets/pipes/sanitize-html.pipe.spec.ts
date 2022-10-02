import { SanitizeHTMLPipe } from './sanitize-html.pipe';

describe('SanitizeHTMLPipe', () => {
  it('create an instance', () => {
    const pipe = new SanitizeHTMLPipe();
    expect(pipe).toBeTruthy();
  });
});
