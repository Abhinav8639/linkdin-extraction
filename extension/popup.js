// LinkedIn profile links
const linkedinProfiles = [
    "https://www.linkedin.com/in/alice-johnson/",
    "https://www.linkedin.com/in/bob-smith/",
    "https://www.linkedin.com/in/rajstriver/",
];

// Keep track of opened tabs
let openedTabs = [];

// Function to open profile and send to backend
async function fetchProfileData(profileUrl) {
    console.log(`Opening profile: ${profileUrl}`);
    
    // Open the LinkedIn profile in a new tab
    const tab = await new Promise((resolve) => {
        chrome.tabs.create({ url: profileUrl }, function(newTab) {
            resolve(newTab);
        });
    });

    // Add the tab ID to openedTabs for tracking
    openedTabs.push(tab.id);

    // Listen for tab updates to extract data once the tab is loaded
    chrome.tabs.onUpdated.addListener(function onUpdated(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
            console.log(`Tab updated: ${tabId}`);
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: extractProfileData
            }, async (results) => {
                if (results && results[0] && results[0].result) {
                    const profileData = results[0].result;
                    console.log('Profile data extracted:', profileData);

                    // Send data to backend
                    try {
                        await fetch('http://localhost:5000/api/profile-data', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(profileData)
                        });
                        document.getElementById('status').innerText = "Profile data sent!";
                        console.log('Data sent to backend successfully.');
                    } catch (error) {
                        document.getElementById('status').innerText = "Error sending data.";
                        console.error('Error sending data:', error);
                    }
                } else {
                    console.error('No profile data found or extraction failed.');
                }
                // Clean up the openedTabs array and remove the tab
                openedTabs = openedTabs.filter(id => id !== tabId);
                chrome.tabs.remove(tab.id);
                // Remove the listener to avoid memory leaks
                chrome.tabs.onUpdated.removeListener(onUpdated);
            });
        }
    });
}

// Function to extract data from LinkedIn page
function extractProfileData() {
    console.log('Extracting profile data...');
    return {
        name: document.querySelector('.text-heading-xlarge')?.innerText || 'N/A',
        location: document.querySelector('.text-body-small')?.innerText || 'N/A',
        about: document.querySelector('.pv-about-section')?.innerText || 'N/A',
        bio: document.querySelector('.pv-top-card-section__summary')?.innerText || 'N/A',
        followerCount: document.querySelector('.follower-count') ? parseInt(document.querySelector('.follower-count').innerText) : 0,
        connectionCount: document.querySelector('.connection-count') ? parseInt(document.querySelector('.connection-count').innerText) : 0,
        url: window.location.href
    };
}

// Start fetching profiles on button click
document.getElementById('fetch-profiles').addEventListener('click', async () => {
    console.log('Fetch profiles button clicked.');
    for (const url of linkedinProfiles) {
        await fetchProfileData(url);
    }
});
