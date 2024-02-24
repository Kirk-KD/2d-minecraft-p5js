import { ItemStack, items } from "./inventory/item.js";

export class CraftingGrid {
  constructor(grid) {
    this.grid = grid;
  }
}

class Recipe {
  constructor(charToItem, resultItem, resultAmount) {
    this.charToItem = charToItem;
    this.itemIDToChar = {};
    for (let key in this.charToItem) this.itemIDToChar[this.charToItem[key].id] = key;

    this.resultItem = resultItem;
    this.resultAmount = resultAmount || 1;
  }

  validate(craftingGrid) {
    return false;
  }

  getResult() {
    return new ItemStack(this.resultItem, this.resultAmount);
  }
}

class ShapedRecipe extends Recipe {
  constructor(shape, charToItem, resultItem, resultAmount) {
    super(charToItem, resultItem, resultAmount);

    this.shape = shape;
    this.rows = this.shape.length;
    this.cols = this.shape[0].length;

    this.shapes = [];
    for (let row = 0; row <= 3 - this.rows; row++) {
      for (let col = 0; col <= 3 - this.cols; col++) {
        let shape = [
          [null, null, null],
          [null, null, null],
          [null, null, null],
        ];
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            shape[row + i][col + j] = this.shape[i][j];
          }
        }
        this.shapes.push(shape);
      }
    }
  }

  validate(craftingGrid) {
    for (let i = 0; i < this.shapes.length; i++) {
      let valid = true;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (
            (craftingGrid.grid[row][col]
              ? this.itemIDToChar[craftingGrid.grid[row][col].id]
              : null) !== this.shapes[i][row][col]
          ) {
            valid = false;
            break;
          }
        }
        if (!valid) break;
      }
      if (valid) return true;
    }
    return false;
  }
}

export const recipes = new (class {
  constructor() {
    this.recipes = [];
  }

  getResult(craftingGrid) {
    for (let i = 0; i < this.recipes.length; i++) {
      if (this.recipes[i].validate(craftingGrid)) {
        return this.recipes[i].getResult();
      }
    }
  }

  register(recipe) {
    this.recipes.push(recipe);
  }
})();

function inverse(obj) {
  var retobj = {};
  for (var key in obj) {
    retobj[obj[key]] = key;
  }
  return retobj;
}

export function loadRecipes() {
  recipes.register(new ShapedRecipe(["W"], { "W": items.Wood }, items.Plank, 4));
  recipes.register(new ShapedRecipe(["P",
                                     "P"], { "P": items.Plank }, items.Stick, 4));
}
