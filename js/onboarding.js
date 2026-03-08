// js/onboarding.js

function startOnboardingTour() {
    // Check if the user has already seen the tour
    if (localStorage.getItem('taskmaster_tour_completed')) {
        return;
    }

    // Initialize Driver.js
    const driver = window.driver.js.driver;

    const driverObj = driver({
        showProgress: true,
        steps: [
            {
                element: '.logo-text',
                popover: {
                    title: 'Welcome to TaskMaster Pro! ⚡',
                    description: 'Let us take a quick tour to show you around your new productivity hub.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '.btn-hamburger',
                popover: {
                    title: 'Navigation Menu',
                    description: 'Click this 3-line menu (hamburger) to open or close the sidebar anytime.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '[data-view="today"]',
                popover: {
                    title: 'Today View ☀️',
                    description: 'Here you will see all the important tasks that you need to focus on right now.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '[data-view="habits"]',
                popover: {
                    title: 'Habit Tracker �',
                    description: 'Want to build new habits? Track your daily progress and streaks right here!',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '.cat-settings-btn',
                popover: {
                    title: 'Manage Categories 📁',
                    description: 'Click this gear icon next to "CATEGORIES" to create, edit, or color-code your task categories.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '.btn-add',
                popover: {
                    title: 'Add Task & Subtasks ➕',
                    description: 'When adding a task from here, you can split big projects into smaller manageable "Subtasks".',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '.pom-widget',
                popover: {
                    title: 'Pomodoro Timer ⏱',
                    description: 'Stay focused! Set work and break intervals to study efficiently and earn XP points.',
                    side: "right",
                    align: 'start'
                }
            }
        ],
        onDestroyStarted: () => {
            if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
                localStorage.setItem('taskmaster_tour_completed', 'true');
                driverObj.destroy();
            }
        },
    });

    // Start the tour
    driverObj.drive();
}

// Ensure the tour starts after the DOM is fully loaded and app is initialized
document.addEventListener('DOMContentLoaded', () => {
    // Delay slightly to let the main app render its initial data
    setTimeout(startOnboardingTour, 1000);
});
