import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-stat-grid',
  templateUrl: './stat-grid.component.html',
  styleUrls: ['./stat-grid.component.scss']
})
export class StatGridComponent implements OnInit {

  @Input() data: any;

  constructor() { }

  ngOnInit(): void {}

}
