const bigInt = require('big-integer');

// Función para realizar el test de Miller-Rabin
function millerRabinTest(n, k) {
    if (n.equals(2) || n.equals(3)) {
        return true;
    }
    if (n.lesser(2) || n.isEven()) {
        return false;
    }

    // Escribe n - 1 como 2^s * d
    let s = 0;
    let d = n.subtract(1);
    while (d.isEven()) {
        d = d.divide(2);
        s += 1;
    }

    WitnessLoop: for (let i = 0; i < k; i++) {
        let a = bigInt.randBetween(2, n.subtract(2));
        let x = a.modPow(d, n);
        if (x.equals(1) || x.equals(n.subtract(1))) {
            continue;
        }
        for (let r = 0; r < s - 1; r++) {
            x = x.modPow(2, n);
            if (x.equals(1)) {
                return false;
            }
            if (x.equals(n.subtract(1))) {
                continue WitnessLoop;
            }
        }
        return false;
    }
    return true;
}

// Función para generar un número primo grande
export function generateLargePrime(bits, k = 256) {
    const min = bigInt(2).pow(bits - 1);
    const max = bigInt(2).pow(bits).subtract(1);

    while (true) {
        const p = bigInt.randBetween(min, max);
        if (millerRabinTest(p, k)) {
            return p;
        }
    }
}

// Ejemplo de uso
const prime = generateLargePrime(512);
console.log("Número primo generado:", prime.toString());
