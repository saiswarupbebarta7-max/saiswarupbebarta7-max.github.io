let today = new Date().toISOString().split("T")[0];

let history = JSON.parse(localStorage.getItem("history")) || {};

let meals = [];

let totalCalories = 0;
let totalProtein = 0;
let totalCarbs = 0;
let totalFats = 0;

let proteinGoal = Number(localStorage.getItem("proteinGoal")) || 120;

let nutritionChart;

// FOOD DATABASE
const foodDB = {

    egg: {cal: 70, protein: 6, carbs: 1, fats: 5},
    chicken: {cal: 165, protein: 31, carbs: 0, fats: 4},
    rice: {cal: 130, protein: 2, carbs: 28, fats: 0},
    milk: {cal: 100, protein: 8, carbs: 12, fats: 5},
    banana: {cal: 105, protein: 1, carbs: 27, fats: 0},
    oats: {cal: 150, protein: 5, carbs: 27, fats: 3},
    whey: {cal: 120, protein: 24, carbs: 3, fats: 1},
    paneer: {cal: 265, protein: 18, carbs: 2, fats: 20}

};

// ADD MEAL
function addMeal() {

    let mealType = document.getElementById("mealType").value;

    let food = document.getElementById("food").value.trim().toLowerCase();

    let quantity = Number(document.getElementById("quantity").value);

    if (!foodDB[food]) {

        alert("Food not found!");
        return;

    }

    totalCalories += foodDB[food].cal * quantity;
    totalProtein += foodDB[food].protein * quantity;
    totalCarbs += foodDB[food].carbs * quantity;
    totalFats += foodDB[food].fats * quantity;

    meals.push({
        type: mealType,
        food: food,
        qty: quantity
    });

    updateUI();

    calculateRating();

    renderMeals();

}

// UPDATE UI
function updateUI() {

    totalCalories = Math.max(0, Math.round(totalCalories));
    totalProtein = Math.max(0, Math.round(totalProtein));
    totalCarbs = Math.max(0, Math.round(totalCarbs));
    totalFats = Math.max(0, Math.round(totalFats));

    document.getElementById("calories").innerText = totalCalories;

    document.getElementById("protein").innerText = totalProtein;

    document.getElementById("carbs").innerText = totalCarbs;

    document.getElementById("fats").innerText = totalFats;

    document.getElementById("goalProgress").innerText =
        `${totalProtein} / ${proteinGoal}`;

    // SAVE HISTORY
    history[today] = {

        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
        meals: meals

    };

    localStorage.setItem("history", JSON.stringify(history));

    localStorage.setItem("proteinGoal", proteinGoal);

    updateChart();

}

// RATING
function calculateRating() {

    let rating = "";

    if (totalProtein >= 100) {
        rating = "Excellent 💪";
    }

    else if (totalProtein >= 70) {
        rating = "Good 👍";
    }

    else if (totalProtein >= 40) {
        rating = "Average 🙂";
    }

    else {
        rating = "Poor 😢";
    }

    document.getElementById("rating").innerText = rating;

}

// RESET DAY
function resetDay() {

    totalCalories = 0;
    totalProtein = 0;
    totalCarbs = 0;
    totalFats = 0;

    meals = [];

    updateUI();

    calculateRating();

    renderMeals();

}

// SET GOAL
function setGoal() {

    let newGoal = Number(document.getElementById("goalInput").value);

    if (newGoal <= 0) {

        alert("Enter valid goal");
        return;

    }

    proteinGoal = newGoal;

    localStorage.setItem("proteinGoal", proteinGoal);

    updateUI();

    alert("Goal Updated!");

}

// DELETE MEAL
function deleteMeal(index) {

    let removedMeal = meals[index];

    let food = removedMeal.food;

    let qty = removedMeal.qty;

    totalCalories -= foodDB[food].cal * qty;
    totalProtein -= foodDB[food].protein * qty;
    totalCarbs -= foodDB[food].carbs * qty;
    totalFats -= foodDB[food].fats * qty;

    meals.splice(index, 1);

    updateUI();

    calculateRating();

    renderMeals();

}

// RENDER MEALS
function renderMeals() {

    let mealList = document.getElementById("mealList");

    mealList.innerHTML = "";

    meals.forEach((m, index) => {

        let li = document.createElement("li");

        li.innerHTML = `
            ${m.type}: ${m.food} x ${m.qty}
            <button onclick="deleteMeal(${index})">❌</button>
        `;

        mealList.appendChild(li);

    });

}

// CREATE CHART
function createChart() {

    const ctx = document.getElementById("nutritionChart");

    nutritionChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: ["Calories", "Protein", "Carbs", "Fats"],

            datasets: [{

                label: "Nutrition",

                data: [0, 0, 0, 0],

                borderWidth: 1

            }]

        }

    });

}

// UPDATE CHART
function updateChart() {

    if (!nutritionChart) return;

    nutritionChart.data.datasets[0].data = [

        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats

    ];

    nutritionChart.update();

}

// LOAD APP
window.onload = function () {

    today = new Date().toISOString().split("T")[0];

    history = JSON.parse(localStorage.getItem("history")) || {};

    // LOAD TODAY'S DATA
    if (history[today]) {

        totalCalories = history[today].calories || 0;

        totalProtein = history[today].protein || 0;

        totalCarbs = history[today].carbs || 0;

        totalFats = history[today].fats || 0;

        meals = history[today].meals || [];

    }

    else {

        totalCalories = 0;
        totalProtein = 0;
        totalCarbs = 0;
        totalFats = 0;
        meals = [];

    }

    // LOAD PROTEIN GOAL
    proteinGoal = Number(localStorage.getItem("proteinGoal")) || 120;

    // UPDATE UI
    updateUI();

    calculateRating();

    renderMeals();

    // SHOW HISTORY
    document.getElementById("historyList").innerHTML = "";

    for (let date in history) {

        if (date !== today) {

            let li = document.createElement("li");

            li.innerText =
                `${date} → Protein: ${history[date].protein}g | Calories: ${history[date].calories}`;

            document.getElementById("historyList").appendChild(li);

        }

    }

}

// GLOBAL DELETE
window.deleteMeal = deleteMeal;