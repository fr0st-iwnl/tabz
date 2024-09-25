document.addEventListener('DOMContentLoaded', () => {
    const tabsList = document.getElementById('tabs-list');
    const splitButton = document.getElementById('split-button');
  

    
    // Get all open tabs and display them in the popup
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        tabs.forEach((tab) => {
            const tabItem = document.createElement('div');
            tabItem.className = 'tab-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tab.id;
            checkbox.style.display = 'none'; // hide the checkbox

            const label = document.createElement('span');
            label.textContent = tab.title;

            tabItem.appendChild(checkbox);
            tabItem.appendChild(label);
            tabsList.appendChild(tabItem);

            tabItem.addEventListener('click', () => {
                tabItem.classList.toggle('selected');
                checkbox.checked = tabItem.classList.contains('selected');

                if (tabItem.classList.contains('selected')) {
                    const checkmark = document.createElement('span');
                    checkmark.textContent = '✔'; // Checkmark symbol
                    checkmark.style.color = '#ffffff'; // Color of checkmark
                    checkmark.className = 'checkmark';
                    tabItem.appendChild(checkmark); // Append checkmark
                } else {
                    const checkmark = tabItem.querySelector('.checkmark');
                    if (checkmark) {
                        tabItem.removeChild(checkmark); // remove checkmark
                    }
                }
            });
        });
    });

    
    // When the split button is clicked get selected tabs and send a message to background script
    splitButton.addEventListener('click', () => {
        const selectedTabIds = Array.from(
            tabsList.querySelectorAll('.tab-item.selected')
        ).map((tabItem) => parseInt(tabItem.querySelector('input[type="checkbox"]').value));

        if (selectedTabIds.length > 0) {
            chrome.runtime.sendMessage({ command: 'splitTabs', tabIds: selectedTabIds });
        }
    });
});
