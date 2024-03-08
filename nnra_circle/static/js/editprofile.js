
document.querySelector('.btn-remove-photo').addEventListener('click', function(){
    showConfirmationModalOne({
        message: 'Are you sure you want to remove your profile photo?', 
        onModalCancel: function(){
            transitionModal('none')
        },
        pContinueText: 'YES, CONTINUE', 
    })
})

