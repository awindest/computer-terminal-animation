document.addEventListener("DOMContentLoaded", function () {
  // Register plugins
  gsap.registerPlugin(ScrambleTextPlugin, SplitText);

  // Create custom ease for animations
  const slideEase = "cubic-bezier(0.65,0.05,0.36,1)";

  // Initialize elements
  const terminalLines = document.querySelectorAll(".terminal-line");
  const preloaderEl = document.getElementById("preloader");
  // const contentEl = document.getElementById("content");
  const deployedEl = document.getElementById("deployed")


  // Special characters for scramble effect
  const specialChars = "▪";
  const alphaCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  // Store original text content for spans that will be scrambled
  const originalTexts = {};
  document
    .querySelectorAll('.terminal-line span[data-scramble="true"]')
    .forEach(function (span, index) {
      const originalText = span.textContent;
      originalTexts[index] = originalText;
      span.setAttribute("data-original-text", originalText);
      span.textContent = "";
    });

  // Set initial state - make sure terminal lines are initially hidden
  gsap.set(".terminal-line", {
    opacity: 0
  });

  // Function to update progress bar
  function updateProgress(percent) {
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      progressBar.style.transition = "none";
      progressBar.style.width = percent + "%";
    }
  }

  // Terminal preloader animation
  function animateTerminalPreloader() {
    // Reset progress to 0%
    updateProgress(0);

    // Create main timeline for text animation
    const tl = gsap.timeline({
      onComplete: function () {
        // Once preloader is done, reveal the content
        revealContent();
      }
    });

    // Total animation duration in seconds
    const totalDuration = 6;

    // Get all terminal lines and sort them by top position
    const allLines = Array.from(document.querySelectorAll(".terminal-line"));
    allLines.sort((a, b) => {
      const aTop = parseInt(a.style.top);
      const bTop = parseInt(b.style.top);
      return aTop - bTop;
    });

    // Create a timeline for text reveal that's synced with progress
    const textRevealTl = gsap.timeline();

    // Process each line for text reveal
    allLines.forEach((line, lineIndex) => {
      // Set base opacity - alternating between full and reduced opacity
      const baseOpacity = lineIndex % 2 === 0 ? 1 : 0.7;

      // Calculate when this line should appear based on total duration
      // Distribute evenly across the first 80% of the animation
      const timePoint = (lineIndex / allLines.length) * (totalDuration * 0.8);

      // Reveal the line
      textRevealTl.to(
        line,
        {
          opacity: baseOpacity,
          duration: 0.3
        },
        timePoint
      );

      // Get all spans in this line that should be scrambled
      const scrambleSpans = line.querySelectorAll('span[data-scramble="true"]');

      // Apply scramble effect to each span
      scrambleSpans.forEach((span) => {
        const originalText =
          span.getAttribute("data-original-text") || span.textContent;

        // Add scramble effect slightly after the line appears
        textRevealTl.to(
          span,
          {
            duration: 0.8,
            scrambleText: {
              text: originalText,
              chars: specialChars,
              revealDelay: 0,
              speed: 0.3
            },
            ease: "none"
          },
          timePoint + 0.1
        );
      });
    });

    // Add the text reveal timeline to the main timeline
    tl.add(textRevealTl, 0);

    // Add periodic scramble effects throughout the animation
    for (let i = 0; i < 5; i++) {
      const randomTime = 1 + i * 1.5; // Spread out the glitch effects
      tl.add(function () {
        const glitchTl = gsap.timeline();

        // Select random elements to glitch
        const allScrambleSpans = document.querySelectorAll(
          'span[data-scramble="true"]'
        );
        const randomSpans = [];

        // Select 3-5 random spans to glitch
        const numToGlitch = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numToGlitch; j++) {
          const randomIndex = Math.floor(
            Math.random() * allScrambleSpans.length
          );
          randomSpans.push(allScrambleSpans[randomIndex]);
        }

        // Apply glitch effect to selected spans
        randomSpans.forEach((span) => {
          const text =
            span.textContent || span.getAttribute("data-original-text");

          // Quick scramble for glitch effect
          glitchTl.to(
            span,
            {
              duration: 0.2,
              scrambleText: {
                text: text,
                chars: specialChars,
                revealDelay: 0,
                speed: 0.1
              },
              ease: "none",
              repeat: 1
            },
            Math.random() * 0.5
          );
        });

        return glitchTl;
      }, randomTime);
    }

    // Add staggered disappearing effect at the end
    const disappearTl = gsap.timeline();

    // Add staggered disappear effect for each line
    disappearTl.to(allLines, {
      opacity: 0,
      duration: 0.2,
      stagger: 0.1, // 0.1 second between each line disappearing
      ease: "power1.in"
    });

    // Add the disappear timeline near the end of the main timeline
    tl.add(disappearTl, totalDuration - 1);

    // Set up progress bar animation that's synced with the main timeline
    tl.eventCallback("onUpdate", function () {
      const progress = Math.min(99, tl.progress() * 100);
      updateProgress(progress);
    });

    // Force final update to 100% at the end
    tl.call(
      function () {
        updateProgress(100);
      },
      [],
      totalDuration - 0.5
    );

    tl.to(
      deployedEl,
      {
        duration: 1.8,
        delay: 1,
        scrambleText: {
          text: "Deployed",
          chars: specialChars,
          revealDelay: .5,
          speed: 0.3
        }
      });

    // use CSS to cause the blinking effect
    return tl;
  }

  // Start terminal preloader animation
  const terminalAnimation = animateTerminalPreloader();

});
