const fileInput = document.getElementById('file-new-photo')
const btnRemovePhoto = document.querySelector('.btn-remove-photo')
const btnSubmit = document.querySelector('.btn-submit')

if(btnRemovePhoto){
    btnRemovePhoto.addEventListener('click', function(){
        showConfirmationModalOne({
            message: 'Are you sure you want to remove your profile photo?', 
            onModalCancel: function(){
                transitionModal('none')
            },
            
            pContinueText: 'YES, CONTINUE', 
            onModalContinue: function(){
                const csrftoken = getcsrfToken()
    
                fetch('/accounts/updatephoto/remove/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken
                    }
                })
                .then(response => response.json())
                .then(data => {
                    showToast({
                        message: data.message,
                        style: data.status == 200? 'success': 'error',
                        duration: data.status== 200? 2000: 3000,
                        onfinshed: data.status == 200?function(){
                            window.location.reload()
                        }: function(){}
                    })
                })
            }
        })
    })
}

document.querySelector('.btn-change-photo').addEventListener('click', function(){
    fileInput.click()
})

fileInput.addEventListener('change', function(){
    if (fileInput.files && fileInput.files.length>0){
        const csrftoken = getcsrfToken()
        const selectedFile = fileInput.files[0]

        const formData = new FormData()
        formData.append('new-photo', selectedFile)

        fetch('/accounts/updatephoto/change/', {
            method: 'POST', 
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            showToast({
                message: data.message, 
                style: data.status == 200? 'success': 'error',
                duration: 2000, 
                onfinshed: function(){
                    window.location.reload()
                }
            })
        })
    }
})

document.getElementById('edit-profile-form').addEventListener('submit', function(e){
    e.preventDefault()
    btnSubmit.disabled =true
    const csrftoken = getcsrfToken()

    const formData = new FormData(this)

    fetch('', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken
        },
        body: formData
    })
    .then(response => response.json())
    .then(data=> {
        showToast({
            message: data.message,
            style: data.status === 200? 'success': 'error',
            duration: 3000,
            onfinshed: data.status === 200? function(){
                window.location.reload()
            }: function(){}
        })
    })
    .finally(()=> {
        btnSubmit.disabled= false
    })
})


