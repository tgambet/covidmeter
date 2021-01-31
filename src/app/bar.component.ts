import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar',
  template: `
    <svg height="15" #svg>
      <ng-container *ngFor="let point of displaySet; last as last; trackBy: trackByFn">
        <rect height="15" [attr.width]="point.length > 0 ? point.length : 0"
              [attr.fill]="point.color" attr.transform="translate({{point.offset}}, 0)">
        </rect>
        <text *ngIf="last && showTotal" attr.transform="translate({{point.offset + point.length + 5}}, 0)" dy="11">
          {{this.label}}
        </text>
      </ng-container>
    </svg>
  `,
  styles: [`
    svg {
      width: 100%;
      display: block;
    }

    rect {
      transition: width ease 150ms, transform ease 150ms;
    }

    text {
      fill: white;
      font-size: 10px;
      transition: transform ease 150ms;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarComponent implements OnInit, OnChanges {

  @ViewChild('svg', {static: true})
  svg: ElementRef;

  @Input()
  dataSet: { value: number; color: string }[] = [];

  @Input()
  offsetRight = 0;

  @Input()
  showTotal = false;

  @Input()
  label;

  displaySet: { length: number; offset: number; color: string }[] = [];

  total = 0;
  length = 0;

  constructor(
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    requestAnimationFrame(() => {
      this.update();
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.offsetRight || changes.dataSet) {
      requestAnimationFrame(() => {
        this.update();
        this.cdr.markForCheck();
      });
    }
  }

  @HostListener('window:resize')
  update() {
    this.length = this.svg.nativeElement.clientWidth - (this.showTotal ? 40 : 0);
    this.total = this.dataSet.reduce((r, point) => r + point.value, 0);
    let offset = 0;
    this.displaySet = this.dataSet.map(point => {
      const result = {
        length: this.total === 0 ? 0 : point.value * this.length / (this.total + this.offsetRight),
        offset,
        color: point.color
      };
      offset += result.length;
      return result;
    });
    this.label = this.label ? this.label : d3.format('.3s')(this.total);
  }

  trackByFn(index, item) {
    return item.color; // or item.id
  }

}
