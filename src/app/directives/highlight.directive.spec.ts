import { HighlightDirective } from './highlight.directive';

import { Directive, ElementRef, Renderer2, HostListener  } from '@angular/core';

describe('HighlightDirective', () => {
  it('should create an instance', () => {

    let elMock: ElementRef;
    let rendererMock: Renderer2;
    const directive = new HighlightDirective(elMock,rendererMock);
    expect(directive).toBeTruthy();
  });
});
