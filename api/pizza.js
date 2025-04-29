import { check } from 'k6';
import http from 'k6/http';

import { getRndInteger } from '../utils/utils.js';

export function makePizza(URL, params) {
    let reqBody = {
        "maxCaloriesPerSlice": getRndInteger(100, 1000),
        "mustBeVegetarian": Math.random() < 0.5,
        "excludedIngredients": [
          "anchovies",
          "bacon"
        ],
        "excludedTools": [],
        "maxNumberOfToppings": getRndInteger(2, 10),
        "minNumberOfToppings": 2
      }
    const res = http.post(URL, JSON.stringify(reqBody), params);
    const isSuccessful = check(res, {
        'Got pizza': (r) => r.status === 200,
        'Pizza is fresh': (r) => r.json().pizza.id > 0, 
    });
    if (!isSuccessful) {
        console.log(`Unable to get pizza ${URL} ${res.status} ${res.body}`);
    }
    return res.json().pizza.id;
}