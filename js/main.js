var userId;

firebase.auth().onAuthStateChanged(function(user) {
    $('#preload').hide();
    if(user) {
        var email = user.email;
        var verified = user.emailVerified;
        userId = user.uid;

        render();
        $('#user').show();
        $('#guest').hide();
    } else {
        $('#user').hide();
        $('#guest').show();
    }
})


$(document).on('click', '#sign-up-btn', function(){
    var email = document.querySelector('[type="email"]').value;
    var password = document.querySelector('[type="password"]').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function() {
            sendVerification();
        })
        .catch(function(error) {
            //Handle Errors here.
            //...
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorCode, errorMessage);
        });
})

function sendVerification() {
    var user = firebase.auth().currentUser;

    user.sendEmailVerification().then(function() {
        // Email sent.
    }).catch(function(error) {
        // An error happened.
    })
}

$(document).on('click', '#logout', function(){
    firebase.auth().signOut().then(function() {
        //Sign-out successful.
    }).catch(function(error) {

    });
})

$('#login').click(function() {
    var email = document.querySelector('[type="email"]').value;
    var password = document.querySelector('[type="password"]').value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(function(error) {
            //Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            //...
            alert(errorCode, errorMessage);
        });
});

function render() {
    firebase.database().ref(`todos/${userId}`).on('value', function(snapshot){
        var html = '';

        var todos = snapshot.val();
        for (var id in todos) {
            var todo = todos[id];

            html += `
                <li class="list-group-item justify-content-between d-flex alignt-items-center" id="todos">
                    <input 
                        data-id="todo-done-edit" 
                        data-todo-id=${id} 
                        data-action="edit-todo" 
                        type="checkbox" ${todo.done ? 'checked' : ''}>
                    <input 
                        data-id="todo-name-edit" 
                        style="width:50%;" 
                        class="form-control"data-todo-id=${id} 
                        data-action="edit-todo" 
                        type="text" 
                        value="${todo.name}">
                    <i data-action="remove-todo" data-todo-id=${id} class="fas fa-trash-alt"></i>
                </li>
            `
        }

        $('#todo-list').html(html);
    });
}

$(document).on('click', '#add', function(){
    var name = $('#name').val();
    var done = $('#done').prop('checked');
    var todoId = Math.ceil(Math.random() * 10000000);

    firebase.database().ref(`todos/${userId}/${todoId}`).set({
        done: done,
        name: name,
    })
})

$(document).on('click', '[data-action="remove-todo"]', function(){
    var todoId = $(this).attr('data-todo-id');
    firebase.database().ref(`todos/${userId}/${todoId}`).remove();
})

$(document).on('change', '[data-action="edit-todo"]', function(){
    var todoId = $(this).attr('data-todo-id');
    var todoName = $(`[data-todo-id="${todoId}"][data-id="todo-name-edit"]`).val();
    var todoDone = $(`[data-todo-id="${todoId}"][data-id="todo-done-edit"]`).prop('checked');
    

    firebase.database().ref(`todos/${userId}/${todoId}`).update({
        done: todoDone,
        name: todoName,
    });
})