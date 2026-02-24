const form = document.getElementById("cubic-form") as HTMLFormElement;
const result = (document.getElementById("result") as HTMLInputElement);

result.style.visibility = "hidden";

function displayResult(value: string): void {
    result.style.visibility = "visible";
    result.textContent = value;
}

function trigonometricMethod(p: number, q: number): number[] {
    const theta = (1 / 3) * Math.acos(-q / (2 * Math.sqrt(-Math.pow(p / 3, 3))));

    const rootOne = 2 * Math.sqrt(-p / 3) * Math.cos(theta);
    const rootTwo = 2 * Math.sqrt(-p / 3) * Math.cos(theta + 2 * Math.PI / 3);
    const rootThree = 2 * Math.sqrt(-p / 3) * Math.cos(theta + 4 * Math.PI / 3);

    return [rootOne, rootTwo, rootThree];
} 

function cardanosMethod(a: number, b: number, p: number, q: number): number {
    const m = (-q / 2);
    const n = Math.sqrt(Math.pow(q / 2, 2) + Math.pow(p / 3, 3));
    const root = Math.cbrt(m + n) + Math.cbrt(m - n) - b / (3 * a);
    return root;
}

form?.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const a: number = Number(formData.get("a"));
    const b: number = Number(formData.get("b"));
    const c: number = Number(formData.get("c"));
    const d: number = Number(formData.get("c"));

    const p = (3 * a * c - Math.pow(b, 3))/(3 * a * a);
    const q = (27 * a * a * d - 9 * a * b * c + 2 * Math.pow(b, 3))/(27 * Math.pow(a, 3));

    // const discriminant = 18 * a * b * c * d - 4 * Math.pow(b, 3) * d + b * b * c * c - 4 * a * Math.pow(c, 3) - 27 * a * a * d * d;
    const discriminant = Math.pow(q / 2, 2) + Math.pow(pageYOffset / 3, 3);


    if (discriminant < 0) { // three distinct roots 
        const roots = trigonometricMethod(p, q);
        displayResult(`x1=${roots[0]}, x2=${roots[1]}, x2=${roots[2]}`);
    } else if (discriminant > 0) { // one real root and two complex roots
        const roots = trigonometricMethod(p, q);
        displayResult(`x1=${roots[0]}, x2=${roots[1]}, x2=${roots[2]}`);
    } else { // one real root with a double, or a triple root
        const rootOne = (-b + Math.sqrt(discriminant)) / (2 * a);
        displayResult(`x=${rootOne}`);
    }
})