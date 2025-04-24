

export const getRandomColor = (): string => {
    const colors = [
      '#5865F2', // blurple
      '#57F287', // green
      '#FEE75C', // yellow
      '#EB459E', // pink
      '#ED4245', // red
      '#FAA61A', // orange
      '#1ABC9C', // teal
      '#3498DB', // light blue
      '#9B59B6', // purple
    ];
  
    return colors[Math.floor(Math.random() * 10000) % colors.length];
  };