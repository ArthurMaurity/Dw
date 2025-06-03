document.addEventListener('DOMContentLoaded', () => {
    // Seleção de todos os elementos necessários
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    const imageFileInput = document.getElementById('imageFile');
    const submitBtn = document.getElementById('submitBtn');
    const charCounter = document.getElementById('charCounter');
    const imagePreview = document.getElementById('imagePreview');
    const spinner = document.getElementById('spinner');
    const globalMessage = document.getElementById('globalMessage');

    const inputsToValidate = [nameInput, emailInput, phoneInput, subjectInput, messageInput];

    // Funções auxiliares para mostrar/limpar erros
    const showError = (input, message) => {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        input.classList.add('invalid');
        errorElement.textContent = message;
    };
    const clearError = (input) => {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        input.classList.remove('invalid');
        if (errorElement) errorElement.textContent = '';
    };

    // 2. CORREÇÃO: Contador de caracteres funcionando
    messageInput.addEventListener('input', () => {
        const count = messageInput.value.length;
        charCounter.textContent = `${count}/100`;
        charCounter.classList.toggle('invalid', count < 100);
        // Também valida o botão ao digitar na mensagem
        checkFormValidity();
    });

    // 5. Desativar botão até que os campos sejam preenchidos
    const checkFormValidity = () => {
        const allValid = inputsToValidate.every(input => input.value.trim() !== '');
        submitBtn.disabled = !allValid;
    };
    inputsToValidate.forEach(input => {
        // Limpa o erro e verifica a validade do botão em cada input
        input.addEventListener('input', () => {
            clearError(input);
            checkFormValidity();
        });
    });

    // 10. CORREÇÃO: Máscara de Telefone robusta
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '').substring(0, 11);
        let formatted = '';
        if (value.length > 0) {
            formatted = '(' + value.substring(0, 2);
        }
        if (value.length > 2) {
            formatted += ') ' + value.substring(2, 7);
        }
        if (value.length > 7) {
            formatted += '-' + value.substring(7, 11);
        }
        e.target.value = formatted;
    });

    // 12. Pré-visualização de Arquivo
    imageFileInput.addEventListener('change', () => {
        const file = imageFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '';
        }
    });

    // Evento de envio do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        inputsToValidate.forEach(clearError); // Limpa erros antigos

        // 3, 8, 9, 11. Validações
        if (nameInput.value.trim() === '') { showError(nameInput, 'Nome é obrigatório.'); isValid = false; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) { showError(emailInput, 'Email inválido.'); isValid = false; }
        if (phoneInput.value.replace(/\D/g, '').length !== 11) { showError(phoneInput, 'Telefone deve ter 11 dígitos.'); isValid = false; }
        if (subjectInput.value === '') { showError(subjectInput, 'Selecione um assunto.'); isValid = false; }
        if (messageInput.value.trim().length < 100) { showError(messageInput, 'A mensagem deve ter no mínimo 100 caracteres.'); isValid = false; }
        
        if (!isValid) return;

        // 6. CORREÇÃO: Simulação de envio funcionando
        spinner.style.display = 'block';
        form.style.display = 'none';

        // Simula o envio
        setTimeout(() => {
            spinner.style.display = 'none';
            
            // 7. Exibir mensagem de sucesso
            globalMessage.textContent = 'Formulário enviado com sucesso! Redirecionando...';
            globalMessage.className = 'success';
            globalMessage.style.display = 'block';

            // 4. Redefinir formulário
            form.reset();
            imagePreview.innerHTML = ''; // Limpa preview
            submitBtn.disabled = true; // Desativa o botão
            charCounter.textContent = '0/100'; // Reseta contador
            charCounter.classList.remove('invalid');
            
            setTimeout(() => {
                // window.location.href = 'obrigado.html'; // Redireciona de fato
                globalMessage.style.display = 'none';
                form.style.display = 'block';
            }, 3000);
        }, 2000);
    });
});