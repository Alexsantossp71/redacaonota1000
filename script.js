document.addEventListener('DOMContentLoaded', () => {
    const essayInput = document.getElementById('essay-input');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const analyzeBtn = document.getElementById('analyze-btn');

    // Update counts on input
    essayInput.addEventListener('input', () => {
        const text = essayInput.value.trim();

        // Character count
        charCount.innerText = `${text.length} caracteres`;

        // Word count
        const words = text ? text.split(/\s+/).length : 0;
        wordCount.innerText = `${words} palavras`;
    });

    // Mock Analysis
    analyzeBtn.addEventListener('click', () => {
        const text = essayInput.value.trim();

        if (text.length < 100) {
            alert('Por favor, escreva um texto um pouco maior para uma análise precisa (mínimo 100 caracteres).');
            return;
        }

        analyzeBtn.innerText = 'Analisando...';
        analyzeBtn.disabled = true;

        // Simulate AI analysis delay
        setTimeout(() => {
            const score = Math.floor(Math.random() * (1000 - 600 + 1)) + 600;
            alert(`Sua pontuação estimada é ${score}/1000!\n\nSugestões:\n1. Use mais conectivos.\n2. Amplie seu repertório sociocultural.\n3. Revise a concordância na introdução.`);
            analyzeBtn.innerText = 'Analisar Redação';
            analyzeBtn.disabled = false;
        }, 1500);
    });

    // Smooth Scrolling for nav links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
