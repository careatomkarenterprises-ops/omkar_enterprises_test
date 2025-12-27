document.querySelector("form").addEventListener("submit", function(e) {
  const btn = e.target.querySelector("button");
  btn.innerText = "Sending...";
  btn.disabled = true;
});
