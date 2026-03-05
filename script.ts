const form = document.getElementById("cubic-form") as HTMLFormElement;
const resultsContainer = document.getElementById("results-container") as HTMLElement;
resultsContainer.style.visibility = "hidden";

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

function drawGraph(a: number, b: number, c: number, d: number, roots: number[]): void {
    const canvas = document.getElementById("graph") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const WIDTH = ctx.canvas.width;
    const HEIGHT = ctx.canvas.height;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // scaling (e.g. 10 = 5 units left and right, going from -5 to 5)
    const xRange = 20;
    const yRange = 20;

    // convert graph coords to canvas (aka translating cartesian coordinates)
    const toCanvasX = (x: number):number => {
        return ((x + xRange / 2) / (xRange)) * WIDTH; //ex. x = 5, -> (5 + 10) / 20 becomes the % on the graph, then times width to scale it
    }

    const toCanvasY = (y: number): number => {
        return HEIGHT / 2 - (y / yRange) * HEIGHT; // canvas y starts at top, so move to middle and subtract % of graph
    }

    // Draw grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;

    for (let x = -xRange/2; x <= xRange/2; x++) { // vertical lines
        const cx = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, HEIGHT);
        ctx.stroke();
    }

    for (let y = -yRange/2; y <= yRange/2; y++) { // horizontal lines 
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(WIDTH, cy);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#aaaaaa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT / 2); ctx.lineTo(WIDTH, HEIGHT / 2); // x
    ctx.moveTo(WIDTH / 2, 0); ctx.lineTo(WIDTH / 2, HEIGHT); // y
    ctx.stroke();

    // Draw curve
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    // write for loop? can calculate y for each x and connect the dots or smthg

    // Draw roots as dots
    ctx.fillStyle = "#E49273";
    for (const root of roots) {
        const cx = toCanvasX(root);
        const cy = toCanvasY(0);
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2); // makes a circle (x, y, radius, startAngle, endAngle)
        ctx.fill();
    }
};

function displayResults(equation: string, a: number, b: number, c: number, d: number, p: number, q: number, discriminant: number, roots: number[]): void {
    resultsContainer.style.visibility = "visible";

    // format roots for display (and determine if there are complex roots)
    roots.sort((a, b) => a - b); // to sort roots by x
    const rootOne = [roots[0].toFixed(2), "0"];
    const rootTwo = (roots.length != 1) ? [roots[1].toFixed(2), "0"] : ["complex", "complex"];
    const rootThree = (roots.length != 1) ? [roots[2].toFixed(2), "0"] : ["complex", "complex"];

    // Get result elements
    (document.getElementById("result-equation") as HTMLInputElement).value = `${equation}`;
    (document.getElementById("result-p") as HTMLInputElement).textContent = `${p.toFixed(5)}`;
    (document.getElementById("result-q") as HTMLInputElement).textContent = `${q.toFixed(5)}`;
    (document.getElementById("result-discriminant") as HTMLInputElement).textContent = `${discriminant.toFixed(5)}`;
    (document.getElementById("root1-x") as HTMLInputElement).textContent = `${rootOne[0]}`;
    (document.getElementById("root1-y") as HTMLInputElement).textContent = `${rootOne[1]}`;
    (document.getElementById("root2-x") as HTMLInputElement).textContent = `${rootTwo[0]}`;
    (document.getElementById("root2-y") as HTMLInputElement).textContent = `${rootTwo[1]}`;
    (document.getElementById("root3-x") as HTMLInputElement).textContent = `${rootThree[0]}`;
    (document.getElementById("root3-y") as HTMLInputElement).textContent = `${rootThree[1]}`;
    drawGraph(a, b, c, d, roots);
}

// Methods to solve for roots
function trigonometricMethod(a: number, b: number, p: number, q: number): number[] {
    const theta = (1 / 3) * Math.acos(-q / (2 * Math.sqrt(-Math.pow(p / 3, 3))));

    const calcRoot = (angle: number): number => {
        return 2 * Math.sqrt(-p / 3) * Math.cos(angle) -b / (3 * a);
    }

    const rootOne = calcRoot(theta);
    const rootTwo = calcRoot(theta + 2 * Math.PI / 3);
    const rootThree = calcRoot(theta + 4 * Math.PI / 3);

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