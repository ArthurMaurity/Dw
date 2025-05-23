let tasks = [];

function addTask() {
    const task = prompt("Digite a nova tarefa:");
    if (task) {
        tasks.push(task);
        alert(`Tarefa "${task}" adicionada!`);
    }
}

function removeTask() {
    const taskNumber = prompt("Digite o número da tarefa para remover:");
    const index = parseInt(taskNumber) - 1;
    
    if (index >= 0 && index < tasks.length) {
        const removed = tasks.splice(index, 1);
        alert(`Tarefa "${removed}" removida!`);
    } else {
        alert("Número inválido!");
    }
}

function listTasks() {
    if (tasks.length === 0) {
        alert("Nenhuma tarefa na lista!");
        return;
    }
    
    let list = "Lista de Tarefas:\n";
    tasks.forEach((task, index) => {
        list += `${index + 1}. ${task}\n`;
    });
    alert(list);
}

while (true) {
    const choice = prompt(
        "Escolha uma opção:\n" +
        "1. Adicionar tarefa\n" +
        "2. Remover tarefa\n" +
        "3. Ver tarefas\n" +
        "4. Sair"
    );

    switch (choice) {
        case "1":
            addTask();
            break;
            
        case "2":
            removeTask();
            break;
            
        case "3":
            listTasks();
            break;
            
        case "4":
            alert("Até logo!");
            window.close();
            break;
            
        default:
            alert("Opção inválida!");
    }
}