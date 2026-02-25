const form = document.getElementById("cubic-form") as HTMLFormElement;
const resultContainer = document.getElementById("result-container") as HTMLElement;

resultContainer.style.visibility = "hidden";

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

function displayResults(equation: string, p: number, q: number, discriminant: number, roots: number[]): void {
    resultContainer.style.visibility = "visible";

    // Change equation display
    const equationDisplay = document.getElementById("equation-display") as HTMLElement;
    equationDisplay.textContent = equation;

    // Result display (temp)
    const result = (document.getElementById("result") as HTMLInputElement);
    result.textContent = `x1=${roots[0].toFixed(4)}, x2=${roots[1].toFixed(4)}, x3=${roots[2].toFixed(4)}`;

    console.log(equation, p, q, discriminant, roots); // to get rid of problems temporarily
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
    
    const formData = new FormData(form);

    const a: number = Number(formData.get("a"));
    const b: number = Number(formData.get("b"));
    const c: number = Number(formData.get("c"));
    const d: number = Number(formData.get("d"));

    const p = (3 * a * c - Math.pow(b, 2))/(3 * a * a);
    const q = (27 * a * a * d - 9 * a * b * c + 2 * Math.pow(b, 3))/(27 * Math.pow(a, 3));

    const discriminant = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);
    const equation = getCubicEquation( a, b, c, d);

    if (discriminant < 0) { // three distinct roots 
        const roots = trigonometricMethod(a, b, p, q);
        displayResults(equation, p, q, discriminant, roots);
    } else if (discriminant > 0) { // one real root and two complex roots
        const root = cardanosMethod(a, b, p, q);
        // displayResults(equation, p, q, discriminant, root); // need to somehow show the single root in the array?
    } else { // one real root with a double, or a triple root
        const rootOne = (-b + Math.sqrt(discriminant)) / (2 * a);

        if (p === 0 && q === 0) { // triple root
            displayResults(equation, p, q, discriminant, [rootOne, rootOne, rootOne]);
        } else { // one real root with a double
            const rootTwo = Math.cbrt(-q / 2) - b / (3 * a);
            displayResults(equation, p, q, discriminant, [rootOne, rootTwo, rootTwo]);
        }
    }
})