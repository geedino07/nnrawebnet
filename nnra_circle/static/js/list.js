const searchInput = document.querySelector('.search-input')
const userCards = document.querySelectorAll('.user-card')
const searchForm = document.getElementById('search-form')
const btnFilterDept = document.getElementById('btn-filter-dept')
const departmentsContainer = document.querySelector(".departments-container");
let selectedDepartment = null
const btnContinue = document.getElementById('btn-continue')

class Office {
  constructor(officeName, departmentName, id) {
    this.officeName = officeName;
    this.departmentName = departmentName;
    this.id = id
  }
}


const officeList = [];
const departmentItems = document.querySelectorAll(".department-item");

departmentItems.forEach(function (departmentItem) {
  const officeName = departmentItem.getAttribute("data-office_name");
  const departmentName = departmentItem.getAttribute("data-dept_name");
  const departmentId = departmentItem.getAttribute("data-id");

  officeList.push(new Office(officeName, departmentName, departmentId));
});

departmentsContainer.addEventListener("click", function (e) {
  const clickedDepartment = e.target.closest('.department-item')
  if (clickedDepartment){
      clickedDepartment.classList.add('selected')
      document.querySelectorAll('.department-item').forEach(function(item) {
          if (item !== clickedDepartment) {
              item.classList.remove('selected');
          }
      });

      const clickedOffice = officeList.find(office=> office.officeName == clickedDepartment.getAttribute('data-office_name'))
      if (clickedOffice) selectedDepartment = clickedOffice
  }

});

btnContinue.addEventListener('click', function(){
  console.log(window)

  if ( !selectedDepartment){
      showAlert('messages-container', "Please select a department", 'error', false)
      return
  }

  const ref = addOrUpdateQueryParam('fd', selectedDepartment.officeName)
  window.location.href = `/accounts/list/${ref}`
})


searchForm.addEventListener('submit', function(e){
  e.preventDefault()
  const searchTerm = searchInput.value
  const ref = addOrUpdateQueryParam('search', searchTerm)
  window.location.href = `/accounts/list/${ref}`
})


userCards.forEach(function(card){
    card.addEventListener('click', function(event){
        const clicked = event.target.closest('.user-card')
        const profileId = clicked.getAttribute('data-profile_id')
        getUser(profileId)
    })
})

btnFilterDept.addEventListener('click', function(){
  transitionModal('select-dept-modal')
})


function addOrUpdateQueryParam(key, value) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // Check if the parameter already exists
  if (params.has(key)) {
      params.set(key, value);
  } else {
      params.append(key, value);
  }

  // Update the URL with the new parameters
  url.search = params.toString();
  // console.log(url.search)
  // window.history.replaceState({}, '', url.href);
  // return url.href
  return url.search
}


function getUser(userId){
    changeProfileHolderState('profile-section', 'loading')
    const csrftoken = getcsrfToken()

    fetch(`/accounts/getprofile/${userId}/`, {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
    })
    .then(response => response.json())
    .then(data => {
        if(data.status == 200){
            showProfile(data.profile)
        }
    })
    .catch(error => {
        if(window.innerWidth > 865){
          changeProfileHolderState('profile-section', 'idle')
        }
        showToast({
            'message': "Error: Couldn't load profile",
            'style': 'error'
        })
    })
}

function showProfile(profile){
    const profileTile = makeProfileTile(profile)
    const profileTileContainer = document.querySelector('.profile-tile-container')
    profileTileContainer.innerHTML = ''
    profileTileContainer.insertAdjacentHTML('afterbegin', profileTile)
    changeProfileHolderState('profile-section', 'profile')
}

function makeProfileTile(profile){
    const profileTile = `
    <div class="profile-tile profile">
    <div class="top-info">
      <div class="left-con">
        <h4 class="profile-username">${profile.user.username}</h4>
        <p class="profile-fullname">${profile.user.first_name} ${profile.user.last_name}</p>
      </div>

      <i class="ri-close-line" onclick="closeRightProfileContent()"></i>
    </div>

    <div class="profile-img-status-con">
      <div class="con">
        <img
          src="${profile.profileImg}"
          alt=""
          style="background-color: #acacad"
        />
        <div class="status ${profile.is_online?'online':'offline'}">
        <div class="circle"></div>
        <p>${profile.is_online?'Online':'Offline'}</p>
      </div>
      </div>
    </div>

    <div class="profile-information">
      <p class="username">${profile.user.username}</p>
      ${profile.about == "" || !profile.about? '': `
      <p class="about">
        ${profile.about}
    </p>
      ` }

      <div class="extras-container">
        <div class="extra">
          <i class="ri-mail-fill"></i>
          <div class="extra-info">
            <p class="extra-description">Email Address</p>
            <p class="extra-content">${profile.user.email}</p>
          </div>
        </div>

        <div class="extra">
        <i class="ri-home-3-fill"></i>
          <div class="extra-info">
              <p class="extra-description">Department</p>
              <p class="extra-content">${profile.office.office_name} </p>
          </div>
      </div>

        ${profile.phone? `  <div class="extra">
        <i class="ri-phone-fill"></i>
        <div class="extra-info">
          <p class="extra-description">Phone</p>
          <p class="extra-content">${profile.phone}</p>
        </div>
      </div>`: ''}
      </div>
    </div>

    <a href="/chat/room/?chat=${profile.user.id}" class="chat-link">
      <button class="chat-with-person">
          <i class="ri-message-2-line"></i>
          <p>Message</p>
      </button>
    </a>


  </div>
    `

    return profileTile
}