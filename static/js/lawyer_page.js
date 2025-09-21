document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/lawyers")   
        .then(res => res.json())
        .then(data => {
            const lawyerList = document.getElementById("lawyer-list");
            lawyerList.innerHTML = "";

            if (data.length === 0) {
                lawyerList.innerHTML = "<p>No lawyers available.</p>";
                return;
            }

            data.forEach(lawyer => {
                const card = document.createElement("div");
                card.className = "lawyer-card horizontal";

                card.innerHTML = `
                    <div>
                        <h3>${lawyer.name}</h3>
                        <p><strong>Specialization:</strong> ${lawyer.specialization}</p>
                        <p><strong>Experience:</strong> ${lawyer.experience} yrs</p>
                        <p><strong>Location:</strong> ${lawyer.location}</p>
                        <p><strong>Fee:</strong> ₹${lawyer.fee}</p>
                    </div>
                `;

                card.addEventListener("click", () => showLawyerDetails(lawyer._id));
                lawyerList.appendChild(card);
            });
        })
        .catch(err => console.error("Error fetching lawyers:", err));
});

function showLawyerDetails(lawyerId) {
    fetch(`/api/lawyer/${lawyerId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(lawyer => {
            // Store lawyer ID so hireLawyer() works
            currentLawyerId = lawyer._id;

            document.getElementById("lawyer-name").innerText = lawyer.name;
            document.getElementById("lawyer-specialization").innerText =
                Array.isArray(lawyer.specialization) ? lawyer.specialization.join(", ") : lawyer.specialization;
            document.getElementById("lawyer-experience").innerText = lawyer.experience;
            document.getElementById("lawyer-location").innerText = lawyer.location;
            document.getElementById("lawyer-fee").innerText = lawyer.fee;
            document.getElementById("lawyer-bio").innerText = lawyer.bio;

            const worksList = document.getElementById("lawyer-works");
            worksList.innerHTML = "";
            if (lawyer.previous_works && lawyer.previous_works.length > 0) {
                lawyer.previous_works.forEach(w => {
                    const li = document.createElement("li");
                    li.innerHTML = `<strong>${w.title}:</strong> ${w.description}`;
                    worksList.appendChild(li);
                });
            } else {
                worksList.innerHTML = "<li>No previous works listed.</li>";
            }

            // Chat button
            document.getElementById("chat-btn").href = `/chatwithlawyer/${lawyer._id}`;

            // Show modal
            document.getElementById("lawyer-modal").classList.remove("hidden");
        })
        .catch(err => {
            console.error("Error fetching lawyer details:", err);
            alert("Failed to load lawyer details. Please try again.");
        });
}

// Close modal
document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("lawyer-modal").classList.add("hidden");
});
// Add these variables at the top
let currentLawyerId = null;
let currentQueryId = null; // You'll need to get this from somewhere

// Update the openModal function to store lawyer ID
function openModal(lawyer) {
    currentLawyerId = lawyer._id;
    
    document.getElementById('lawyer-name').textContent = lawyer.name;
    document.getElementById('lawyer-specialization').textContent = lawyer.specialization.join(', ');
    document.getElementById('lawyer-experience').textContent = lawyer.experience;
    document.getElementById('lawyer-location').textContent = lawyer.location;
    document.getElementById('lawyer-fee').textContent = lawyer.fee;
    document.getElementById('lawyer-bio').textContent = lawyer.bio;
    
    const worksList = document.getElementById('lawyer-works');
    worksList.innerHTML = '';
    if (lawyer.previous_works && lawyer.previous_works.length > 0) {
        lawyer.previous_works.forEach(work => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${work.title}</strong>: ${work.description}`;
            worksList.appendChild(li);
        });
    } else {
        worksList.innerHTML = '<li>No previous works listed</li>';
    }
    
    // Update chat button link
    document.getElementById('chat-btn').href = `/chatwithlawyer/${lawyer._id}`;
    
    document.getElementById('lawyer-modal').classList.remove('hidden');
}

// Add hire lawyer function
async function hireLawyer() {
    console.log("▶️ Hire Lawyer button clicked");
    console.log("Current Lawyer ID:", currentLawyerId);

    if (!currentLawyerId) {
        alert("❌ No lawyer selected. Please select a lawyer first.");
        return;
    }

    try {
        const queriesResponse = await fetch('/api/queries');
        if (!queriesResponse.ok) {
            throw new Error(`Failed to fetch queries: ${queriesResponse.status}`);
        }

        const queriesData = await queriesResponse.json();
        console.log("Fetched Queries:", queriesData);

        if (!queriesData.queries || queriesData.queries.length === 0) {
            alert("⚠️ Please create a legal query first before hiring a lawyer.");
            return;
        }

        // Build a selection list from queries
        const queryOptions = queriesData.queries
            .map((q, idx) => `${idx + 1}. ${q.title || q.text || "Untitled Query"} (ID: ${q.id})`)
            .join("\n");

        const queryChoice = prompt(
            "Select a query by entering the number:\n\n" + queryOptions
        );

        if (!queryChoice || isNaN(queryChoice) || queryChoice < 1 || queryChoice > queriesData.queries.length) {
            alert("❌ Invalid choice. Please try again.");
            return;
        }

        currentQueryId = queriesData.queries[queryChoice - 1].id;
        console.log("Selected Query ID:", currentQueryId);

        // Ask user for case title
        const caseTitle = prompt('Please enter a title for your case (e.g., "Property Dispute Case"):');
        if (!caseTitle) {
            alert("❌ Case title is required to proceed.");
            return;
        }

        // Send hire request
        const response = await fetch('/api/hire-lawyer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lawyer_id: currentLawyerId,
                query_id: currentQueryId,
                case_title: caseTitle
            })
        });

        const result = await response.json();
        console.log("Hire Lawyer Response:", result);

        if (response.ok && result.success) {
            alert("✅ Lawyer hired successfully! You can now track their progress in 'My Lawyers' section.");
            window.location.href = '/hired-lawyers';
        } else {
            alert("❌ Failed to hire lawyer: " + (result.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error hiring lawyer:", error);
        alert("❌ An error occurred while hiring the lawyer. Please try again later.");
    }
}



// Add event listener for hire button
document.addEventListener('DOMContentLoaded', function() {
    const hireBtn = document.getElementById('hire-btn');
    if (hireBtn) {
        hireBtn.addEventListener('click', hireLawyer);
    }
    
    // Close modal when clicking outside
    document.getElementById('lawyer-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
    
    // Close button
    document.querySelector('.close-btn').addEventListener('click', function() {
        document.getElementById('lawyer-modal').classList.add('hidden');
    });
});