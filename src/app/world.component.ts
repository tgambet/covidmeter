import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';

@Component({
  selector: 'app-world',
  template: `
    <app-overview>
      <a mat-icon-button [routerLink]="['/']">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <span>World overview</span>
      <mat-icon>language</mat-icon>
    </app-overview>
    <app-timeline></app-timeline>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px 16px 100px 16px;
      width: 100%;
      box-sizing: border-box;
      max-width: 600px;
      margin: 0 auto;
    }

    a {
      position: relative;
      left: -8px;
    }

    mat-icon {
      margin-left: auto;
    }

    app-overview {
      margin-bottom: 16px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }
}
