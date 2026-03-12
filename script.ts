const form = document.getElementById("cubic-form") as HTMLFormElement;

// Displaying results
function getCubicEquation(a: number, b: number, c: number, d: number): string {
    let equation: string = "";

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

    return (equation + " = 0");
}

function drawGraph(a: number, b: number, c: number, d: number, roots: number[]): void {
    const canvas = document.getElementById("graph") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    const gridSize: number = 20; // scaling (e.g. 10 = 5 units left and right, going from -5 to 5). should be an even number

    // convert graph coords to canvas (aka translating cartesian coordinates)
    const toCanvasX = (x: number): number => {
        return width / 2 + (x / gridSize) * width; //ex. x = 5, -> (5 + 10) / 20 becomes the % on the graph, then times width to scale it
    };

    const toCanvasY = (y: number): number => {
        return height / 2 - (y / gridSize) * height; // canvas y starts at top, so move to middle and subtract % of graph
    };

    // Draw grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;

    for (let x = -gridSize / 2; x <= gridSize / 2; x++) { // vertical lines
        const cx: number = toCanvasX(x);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
    }

    for (let y = -gridSize / 2; y <= gridSize / 2; y++) { // horizontal lines 
        const cy = toCanvasY(y);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#aaaaaa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); // x axis
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); // y axis
    ctx.stroke();

    // Draw curve
    ctx.strokeStyle = "#E49273";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -gridSize / 2; x < gridSize / 2; x += 0.15) { // smaller step = more detailed curve.
        const cx = toCanvasX(x);
        const cy = toCanvasY(a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d); // use abcd values to calculate y for each x

        ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Draw roots as dots
    ctx.fillStyle = "#7180acff";
    for (const root of roots) {
        const cx = toCanvasX(root);
        const cy = toCanvasY(0);
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2); // makes a circle (x, y, radius, startAngle, endAngle)
        ctx.fill();
    }
};

function displayResults(equation: string, a: number, b: number, c: number, d: number, p: number, q: number, discriminant: number, roots: number[]): void {
    (document.getElementById("results-container") as HTMLElement).style.visibility = "visible";

    // format roots for display (and determine if there are complex roots)
    roots.sort((a, b) => a - b); // to sort roots by x
    const rootOne: string = roots[0].toFixed(2); 
    const rootTwo: string = (roots.length !== 1) ? roots[1].toFixed(2) : "complex";
    const rootThree: string = (roots.length !== 1) ? roots[2].toFixed(2) : "complex";
   
    // Updates text content of result elements
    const updateElement = (id: string, value: string): void => {
        (document.getElementById(id) as HTMLElement).textContent = value;
    };

    updateElement("result-equation", equation);
    updateElement("result-p", p.toFixed(5));
    updateElement("result-q", q.toFixed(5));
    updateElement("result-discriminant", discriminant.toFixed(5));
    updateElement("root1-x", rootOne);
    updateElement("root1-y", "0");
    updateElement("root2-x", rootTwo);
    updateElement("root2-y", "0");
    updateElement("root3-x", rootThree);
    updateElement("root3-y", "0");
    drawGraph(a, b, c, d, roots);
}

// Methods to solve for roots
function trigonometricMethod(a: number, b: number, p: number, q: number): number[] {
    const theta: number = (1 / 3) * Math.acos(-q / (2 * Math.sqrt(-Math.pow(p / 3, 3))));

    const calcRoot = (angle: number): number => {
        return 2 * Math.sqrt(-p / 3) * Math.cos(angle) - b / (3 * a);
    };

    return [calcRoot(theta), calcRoot(theta + 2 * Math.PI / 3), calcRoot(theta + 4 * Math.PI / 3)];
}

function cardanosMethod(a: number, b: number, p: number, q: number): number {
    return Math.cbrt((-q / 2) + Math.sqrt(Math.pow(q / 2, 2) + Math.pow(p / 3, 3))) + Math.cbrt((-q / 2) - Math.sqrt(Math.pow(q / 2, 2) + Math.pow(p / 3, 3))) - b / (3 * a);
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

    if (a !== 0) { // a value cannot be 0
        const p: number = (3 * a * c - Math.pow(b, 2)) / (3 * a * a);
        const q: number = (27 * a * a * d - 9 * a * b * c + 2 * Math.pow(b, 3)) / (27 * Math.pow(a, 3));
        const discriminant: number = (q / 2) * (q / 2) + (p / 3) * (p / 3) * (p / 3); // Math.pow() causes some issues in some cases
        const equation: string = getCubicEquation(a, b, c, d);

        // Root cases
        if (discriminant < 0) { // three distinct roots 
            const roots: number[] = trigonometricMethod(a, b, p, q);
            displayResults(equation, a, b, c, d, p, q, discriminant, roots);
        } else if (discriminant > 0) { // one real root and two complex roots
            const root: number = cardanosMethod(a, b, p, q);
            displayResults(equation, a, b, c, d, p, q, discriminant, [root]);
        } else { // one real root with a double, or a triple root
            const rootOne: number = cardanosMethod(a, b, p, q);
            if (p === 0 && q === 0) { // triple root
                displayResults(equation, a, b, c, d, p, q, discriminant, [rootOne, rootOne, rootOne]);
            } else { // one real root with a double
                const rootTwo: number = Math.cbrt(q / 2) - b / (3 * a);
                displayResults(equation, a, b, c, d, p, q, discriminant, [rootOne, rootTwo, rootTwo]);
            }
        }
    } else { // give an alert when a = 0
        alert("Coefficient a cannot be 0");
    }
});