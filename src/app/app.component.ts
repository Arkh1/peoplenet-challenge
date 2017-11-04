////////////////////////////////////////////////////////////////////////////
//  To whom it may concern,                                               //
//                                                                        //
//  A lot of this content should be broken out into smaller components,   //
//  but it is 3:30AM and I have reached the point of calling it good      //
//  enough for a code challenge.  This project is also currently lacking  //
//  unit & e2e tests.  A fair amount of time spent on the project was     //
//  spent researching the various labyrinth pathing algorithms.           //
//  Eventually I just used the pathfinding library rather than rolling my //
//  own.  I also used Connor's https://peoplenet.cogara.io/ as a starting //
//  point in order to get the ball rolling.  Thank you for your           //
//  consideration.                                                        //
//                                                                        //
//                                                        ~ Mark Rupp     //
//                                                                        //
//  P.S.  The js error in the console is an Angular Material bug.         //
////////////////////////////////////////////////////////////////////////////

import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material';
import {ValidationDialogComponent} from './validation-dialog/validation-dialog.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {LegendDataSource} from './legend-data-source';
import {MazeData} from './maze-data';
const PF = require('pathfinding');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) {}

  displayedColumns: Array<string> = ['character', 'component'];
  legend = new LegendDataSource();
  mazes: Array<any> = new MazeData().data;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  mazeStartY: number;
  mazeStartX: number;
  mazeEndY: number;
  mazeEndX: number;
  matrix: Array<Array<number>>;
  pathfinderMatrix: any;
  solvedPathfinderMatrix: any;
  path: any;
  mazeBox: any;

  private static validateMaze(mazeString: string) {
    return /^([AB#\.\r\n]*)$/g.test(mazeString);
  }

  ngOnInit(): void {
    this.setFormGroups();
  }

  solveMaze(mazeString: string): void {
    if (!AppComponent.validateMaze(mazeString)) {
      this.displayValidationModal();
      return;
    }
    this.matrix = this.formatMazeGrid(mazeString);
    const maze = new PF.Grid(this.matrix);
    const finder = new PF.BreadthFirstFinder({
      diagonalMovement: PF.DiagonalMovement.Never
    });
    this.path = finder.findPath(this.mazeStartX, this.mazeStartY,
      this.mazeEndX, this.mazeEndY, maze);
    this.pathfinderMatrix = maze;
  }

  showSolution(): void {
    this.solvedPathfinderMatrix = { ...this.pathfinderMatrix };

    for (const row of this.solvedPathfinderMatrix.nodes) {
      row.forEach((matrixNode, nodeIndex, nodeArray) => {
        for (const pathNode of this.path) {
          if (pathNode[0] === matrixNode.x && pathNode[1] === matrixNode.y) {
            if (this.mazeStartY === matrixNode.x && this.mazeStartX === matrixNode.y) {
              nodeArray[nodeIndex].start = true;
            } else if (this.mazeEndX === matrixNode.x && this.mazeEndY === matrixNode.y) {
              nodeArray[nodeIndex].end = true;
            } else {
              nodeArray[nodeIndex].path = true;
            }
          }
        }
      });
    }
  }

  clear(): void {
    this.setFormGroups();
    this.mazeBox = null;
    this.matrix = null;
    this.pathfinderMatrix = null;
    this.path = null;
    this.solvedPathfinderMatrix = null;
  }

  setFormGroups(): void {
    this.firstFormGroup = this._formBuilder.group({
      selectedMaze: ['', Validators.required],
      mazeBox: ['', Validators.pattern(/^([AB#\.\r\n]*)$/g)]
    });
    this.secondFormGroup = this._formBuilder.group({});
  }

  private displayValidationModal(): void {
    this.dialog.open(ValidationDialogComponent, {
      width: '250px',
      data: {
        title: 'Invalid Maze',
        message: 'Awww...  Maybe next time.',
      }
    });
  }

  private formatMazeGrid(mazeString: string): Array<Array<number>> {
    const matrix: Array<Array<number>> = [];
    const mazeRows: Array<any> = mazeString.split('\n');
    mazeRows.forEach((value, index, mazeRowsArray) => {
      const foundStartColumn: boolean = value.indexOf('A') !== -1;
      const foundEndColumn: boolean = value.indexOf('B') !== -1;
      if (foundStartColumn) {
        this.mazeStartY = index;
        this.mazeStartX = value.indexOf('A');
      }
      if (foundEndColumn) {
        this.mazeEndY = index;
        this.mazeEndX = value.indexOf('B');
      }
      mazeRowsArray = value.replace(/#/g, 1).replace(/[A-B]|\./g, 0).split('');
      mazeRowsArray.forEach((stringValue, stringIndex, stringArray)  => {
        stringArray[stringIndex] = parseInt(stringValue, 10);
      });
      matrix.push(mazeRowsArray);
    });
    return matrix;
  }
}
