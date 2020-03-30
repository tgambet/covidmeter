import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <p>
      <a href="mailto:contact@creasource.net">contact@creasource.net</a>
    </p>
  `,
  styles: [`
    :host {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    a {
      color: white;
    }
  `]
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
