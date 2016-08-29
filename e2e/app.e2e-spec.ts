import { Ng2ImageOverlapPage } from './app.po';

describe('ng2-image-overlap App', function() {
  let page: Ng2ImageOverlapPage;

  beforeEach(() => {
    page = new Ng2ImageOverlapPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
