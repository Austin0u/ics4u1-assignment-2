import type { ChartConfiguration } from 'chart.js/auto';

const form = document.getElementById("cubic-form") as HTMLFormElement;
const resultsContainer = document.getElementById("results-container") as HTMLElement;
// resultsContainer.style.visibility = "hidden";

// Displaying results
function getCubicEquation(a: number, b: number, c: number, d: number): string {
    let equation = "";

    // a term (x^3 coefficient)
    if (a === 1) {
        equation = "x³";
    } else if (a === -1) {
        equation = "-x³";
    } else {
        equation = a + "x³";
    }

    // b term (x^2 coefficient)
    if (b !== 0) {
        const sign = b > 0 ? " + " : " - ";
        const coeff = Math.abs(b);
        equation += coeff === 1 ? sign + "x²" : sign + coeff + "x²";
    }

    // c term (x coefficient)
    if (c !== 0) {
        const sign = c > 0 ? " + " : " - ";
        const coeff = Math.abs(c);
        equation += coeff === 1 ? sign + "x" : sign + coeff + "x";
    }

    // d term (constant)
    if (d !== 0) {
        const sign = d > 0 ? " + " : " - ";
        equation += sign + Math.abs(d);
    }

    equation += " = 0";
    return equation;
}

let xValues: number[] = [];
let yValues: number[] = [];

function generateData(value: string, i1: number, i2: number, step: number) {
    for (let x = i1; x <= i2; x += step) {
        yValues.push(eval(value));
        xValues.push(x);
    }
}

function drawGraph(a: number, b: number, c: number, d: number, roots: number[]): void {
    const canvas = document.getElementById("graph") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears graph

    generateData(`${a} * Math.pow(x, 3) + ${b} * Math.pow(x, 2) + ${c} * x + ${d}`, -10, 10, 0.5)
    const config: ChartConfiguration = {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                fill: false,
                pointRadius: 1,
                borderColor: "rgba(255,0,0,0.5)",
                data: yValues
            }]
        },
        options: {
            scales: {
                x: {title: { display: true, text: 'x' }},
                y: {title: { display: true, text: 'y'}
              }
            }   
        }
    };
}

function displayResults(equation: string, a: number, b: number, c: number, d: number, p: number, q: number, discriminant: number, roots: number[]): void {
    resultsContainer.style.visibility = "visible";

    // format roots for display (and determine if there are complex roots)
    roots.sort((a, b) => a - b); // to sort roots by x
    const rootOne = [roots[0].toFixed(2), "0"];
    const rootTwo = (roots.length != 1) ? [roots[1].toFixed(2), "0"] : ["complex", "complex"];
    const rootThree = (roots.length != 1) ? [roots[2].toFixed(2), "0"] : ["complex", "complex"];

    // Get result elements
    (document.getElementById("result-equation") as HTMLInputElement).value =  `${equation}`;
    (document.getElementById("result-p") as HTMLInputElement).textContent =  `${p.toFixed(5)}`;
    (document.getElementById("result-q") as HTMLInputElement).textContent =  `${q.toFixed(5)}`;
    (document.getElementById("result-discriminant") as HTMLInputElement).textContent = `${discriminant.toFixed(5)}`;
    (document.getElementById("root1-x") as HTMLInputElement).textContent =  `${rootOne[0]}`;
    (document.getElementById("root1-y") as HTMLInputElement).textContent =  `${rootOne[1]}`;
    (document.getElementById("root2-x") as HTMLInputElement).textContent =  `${rootTwo[0]}`;
    (document.getElementById("root2-y") as HTMLInputElement).textContent =  `${rootTwo[1]}`;
    (document.getElementById("root3-x") as HTMLInputElement).textContent =  `${rootThree[0]}`;
    (document.getElementById("root3-y") as HTMLInputElement).textContent =  `${rootThree[1]}`;
    drawGraph(a, b, c, d, roots);
}

// Methods to solve for roots
function trigonometricMethod(a: number, b: number, p: number, q: number): number[] {
    const theta = (1 / 3) * Math.acos(-q / (2 * Math.sqrt(-Math.pow(p / 3, 3))));
    const shift = -b / (3 * a);

    const rootOne = 2 * Math.sqrt(-p / 3) * Math.cos(theta) + shift;
    const rootTwo = 2 * Math.sqrt(-p / 3) * Math.cos(theta + 2 * Math.PI / 3) + shift;
    const rootThree = 2 * Math.sqrt(-p / 3) * Math.cos(theta + 4 * Math.PI / 3) + shift;

    return [rootOne, rootTwo, rootThree];
}

function cardanosMethod(a: number, b: number, p: number, q: number): number {
    const m = (-q / 2);
    const n = Math.sqrt(Math.pow(q / 2, 2) + Math.pow(p / 3, 3));
    const root = Math.cbrt(m + n) + Math.cbrt(m - n) - b / (3 * a);
    return root;
}

// Form submission
form?.addEventListener("submit", (event) => {
    event.preventDefault();

    // form data
    const formData = new FormData(form);

    const a: number = Number(formData.get("a"));
    const b: number = Number(formData.get("b"));
    const c: number = Number(formData.get("c"));
    const d: number = Number(formData.get("d"));

    if (a != 0) { // a value cannot be 0
        const p = (3 * a * c - Math.pow(b, 2)) / (3 * a * a);
        const q = (27 * a * a * d - 9 * a * b * c + 2 * Math.pow(b, 3)) / (27 * Math.pow(a, 3));

        const discriminant = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);
        const equation = getCubicEquation(a, b, c, d);

        // Root cases
        if (discriminant < 0) { // three distinct roots 
            const roots = trigonometricMethod(a, b, p, q);
            displayResults(equation, a, b, c, d, p, q, discriminant, [roots[0], roots[1], roots[2]]);
        } else if (discriminant > 0) { // one real root and two complex roots
            const root = cardanosMethod(a, b, p, q);
            displayResults(equation, a, b, c, d, p, q, discriminant, [root]);
        } else { // one real root with a double, or a triple root
            const rootOne = cardanosMethod(a, b, p, q);
            if (p === 0 && q === 0) { // triple root
                displayResults(equation, a, b, c, d, p, q, discriminant, [rootOne, rootOne, rootOne]);
            } else { // one real root with a double
                const rootTwo = Math.cbrt(-q / 2) - b / (3 * a);
                displayResults(equation, a, b, c, d, p, q, discriminant, [rootOne, rootTwo, rootTwo]);
            }
        }
    } else { // give an alert when a = 0
        alert("Coefficient a cannot be 0. Please enter a valid cubic equation.");
    }
})