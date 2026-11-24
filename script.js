const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

const pivotX = 400;
const pivotY = 290;
const beamY = 260;
const PX_PER_CM = 10; // Skala: 10 px = 1 cm

let masses = [
    { xCm: -15, mass: 3, radius: 22, color: "#3498db", label: "m1" },
    { xCm: 15,  mass: 4, radius: 20, color: "#2ecc71", label: "m2" }
];

let angle = 0;
let angularVelocity = 0;

function hitungPusatMassaCm() {
    let totalMass = 0;
    let momenCm = 0;

    masses.forEach(b => {
        const m = Math.max(0.1, Number(b.mass) || 0.1);
        const x = Number(b.xCm) || 0;
        totalMass += m;
        momenCm += m * x;
    });

    return {
        xCm: momenCm / totalMass,
        totalMass: totalMass
    };
}

function terapkanNilai() {
    masses[0].mass = Math.max(0.1, parseFloat(document.getElementById("m1").value) || 1);
    masses[0].xCm = parseFloat(document.getElementById("x1").value) || 0;
    masses[1].mass = Math.max(0.1, parseFloat(document.getElementById("m2").value) || 1);
    masses[1].xCm = parseFloat(document.getElementById("x2").value) || 0;
}

function setSeimbang() {
    const m1 = Math.max(0.1, parseFloat(document.getElementById("m1").value) || 1);
    const x1 = parseFloat(document.getElementById("x1").value) || -15;
    const m2 = Math.max(0.1, parseFloat(document.getElementById("m2").value) || 1);

    const x2Seimbang = -(m1 * x1) / m2;
    masses[0].mass = m1;
    masses[0].xCm = x1;
    masses[1].mass = m2;
    masses[1].xCm = x2Seimbang;

    document.getElementById("x2").value = Math.round(x2Seimbang * 100) / 100;
}

function updateFisika() {
    const cm = hitungPusatMassaCm();
    const cmPx = cm.xCm * PX_PER_CM;

    const targetAngle = Math.max(-0.35, Math.min(0.35, cmPx * 0.0018));
    const diff = targetAngle - angle;

    angularVelocity = angularVelocity * 0.85 + diff * 0.08;
    angle += angularVelocity;

    const cmScreenX = pivotX + cmPx * Math.cos(angle);
    const selisihTumpuPx = Math.abs(cmScreenX - pivotX);

    const statusEl = document.getElementById("statusText");
    const coordEl = document.getElementById("coordText");
    const analisisEl = document.getElementById("analisisPerhitungan");

    if (statusEl) {
        if (selisihTumpuPx < 2) {
            statusEl.innerHTML = 'Status: <strong style="color:#2ecc71;">SEIMBANG</strong> (Pusat Massa tepat di atas titik tumpu).';
        } else if (cmScreenX < pivotX) {
            statusEl.innerHTML = 'Status: <strong style="color:#3498db;">MIRING KE KIRI</strong> (Pusat Massa di kiri titik tumpu).';
        } else {
            statusEl.innerHTML = 'Status: <strong style="color:#e74c3c;">MIRING KE KANAN</strong> (Pusat Massa di kanan titik tumpu).';
        }
    }

    if (coordEl) {
        coordEl.textContent = "Total Massa = " + cm.totalMass.toFixed(1) +
            " | Posisi Pusat Massa relatif dari tumpu = " + cm.xCm.toFixed(2) + " cm";
    }

    if (analisisEl) {
        const m1 = masses[0].mass;
        const x1 = masses[0].xCm;
        const m2 = masses[1].mass;
        const x2 = masses[1].xCm;
        const momen1 = m1 * x1;
        const momen2 = m2 * x2;
        const totalMomen = momen1 + momen2;
        const x2Ideal = -(m1 * x1) / m2;

        analisisEl.innerHTML =
            "<strong>Momen 1 (m1 &middot; x1):</strong> " + m1 + " &times; (" + x1.toFixed(2) + " cm) = " + momen1.toFixed(2) + "<br>" +
            "<strong>Momen 2 (m2 &middot; x2):</strong> " + m2 + " &times; (" + x2.toFixed(2) + " cm) = " + momen2.toFixed(2) + "<br>" +
            "<strong>Perhitungan X<sub>cm</sub>:</strong> (" + momen1.toFixed(2) + " + " + momen2.toFixed(2) + ") / " + cm.totalMass.toFixed(1) +
            " = " + totalMomen.toFixed(2) + " / " + cm.totalMass.toFixed(1) + " = <strong>" + cm.xCm.toFixed(2) + " cm</strong><br>" +
            "<strong>Posisi x2 agar seimbang:</strong> " + x2Ideal.toFixed(2) + " cm";
    }
}

function gambar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lantai dasar
    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(0, pivotY + 35, canvas.width, canvas.height - (pivotY + 35));

    // Titik tumpu (segitiga)
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX - 25, pivotY + 35);
    ctx.lineTo(pivotX + 25, pivotY + 35);
    ctx.closePath();
    ctx.fillStyle = "#95a5a6";
    ctx.fill();

    // Batang dan benda bermassa
    ctx.save();
    ctx.translate(pivotX, beamY);
    ctx.rotate(angle);

    ctx.fillStyle = "#bdc3c7";
    ctx.fillRect(-240, -5, 480, 10);

    masses.forEach(b => {
        const bx = b.xCm * PX_PER_CM;
        const by = -5 - b.radius;

        ctx.beginPath();
        ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.label + "=" + b.mass, bx, by);
    });

    // Titik Pusat Massa (kuning)
    const cm = hitungPusatMassaCm();
    const cmPx = cm.xCm * PX_PER_CM;

    ctx.beginPath();
    ctx.arc(cmPx, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#f1c40f";
    ctx.fill();
    ctx.strokeStyle = "#d35400";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    updateFisika();
    requestAnimationFrame(gambar);
}

gambar();