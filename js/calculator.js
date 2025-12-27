// OMKAR ENTERPRISES - ROI CALCULATOR
function calculateReturns() {
    const amount = document.getElementById('calc-amount').value;
    const monthlyRate = 0.025; // 2.5%
    const tenure = 13; // 13 Months
    
    const monthlyPayout = amount * monthlyRate;
    const totalEarnings = monthlyPayout * tenure;
    
    document.getElementById('res-monthly').innerText = "₹" + monthlyPayout.toLocaleString('en-IN');
    document.getElementById('res-total').innerText = "₹" + totalEarnings.toLocaleString('en-IN');
}

// Initial Call
if(document.getElementById('calc-amount')) {
    document.getElementById('calc-amount').addEventListener('input', calculateReturns);
}
