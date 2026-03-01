const form = document.getElementById("cubic-form") as HTMLFormElement;
const resultsContainer = document.getElementById("results-container") as HTMLElement;

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
    // format roots for display (and determine if there are complex roots)
    let rootOne: string = roots[0].toFixed(2);
    let rootTwo: string = "N/A";
    let rootThree: string = "N/A";

    if (roots.length != 1) {
        rootTwo = roots[1].toFixed(2);
        rootThree = roots[2].toFixed(2);
    }

    // create new html inside the container
    const resultsHTML = `
        <h3 class="equation-heading">${equation}</h3>
        <div class="results-layout">
            <div class="data-section">
                <div class="value-card">
                    <div class="value-pair">
                        <span class="value-label">p:</span>
                        <span class="value-content">${p.toFixed(5)}</span>
                    </div>
                    <div class="card-divider"></div>
                    <div class="value-pair">
                        <span class="value-label">q:</span>
                        <span class="value-content">${q.toFixed(5)}</span>
                    </div>
                    <div class="card-divider"></div>
                    <div class="value-pair">
                        <span class="value-label">Discriminant:</span>
                        <span class="value-content">${discriminant.toFixed(5)}</span>
                    </div>
                </div>
                <div class="roots-table">
                    <div class="roots-header">
                        <span>Root</span>
                        <span>x</span>
                        <span>y</span>
                    </div>
                    <div class="roots-row">
                        <span>Root 1</span>
                        <span>${rootOne}</span>
                        <span>0</span>
                    </div>
                    <div class="roots-row">
                        <span>Root 2</span>
                        <span>${rootTwo}</span>
                        <span>0</span>
                    </div>
                    <div class="roots-row">
                        <span>Root 3</span>
                        <span>${rootThree}</span>
                        <span>0</span>
                    </div>
                </div>
            </div>
            <div class="graph-section">
                <div class="canvas-placeholder">put graph here</div>
            </div>
        </div>
    `;

    // replace/insert html into container
    resultsContainer.innerHTML = resultsHTML;
    console.log(equation, p, q, discriminant, roots);
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

    // Calculate key values
    const p = (3 * a * c - Math.pow(b, 2)) / (3 * a * a);
    const q = (27 * a * a * d - 9 * a * b * c + 2 * Math.pow(b, 3)) / (27 * Math.pow(a, 3));

    const discriminant = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);
    const equation = getCubicEquation(a, b, c, d);

    // Root cases
    if (discriminant < 0) { // three distinct roots 
        const roots = trigonometricMethod(a, b, p, q);
        displayResults(equation, p, q, discriminant, [roots[0], roots[1], roots[2]]);
    } else if (discriminant > 0) { // one real root and two complex roots
        const root = cardanosMethod(a, b, p, q);
        displayResults(equation, p, q, discriminant, [root]);
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