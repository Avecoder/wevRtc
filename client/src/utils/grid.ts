export const calculationGrid = (count: number): React.CSSProperties => {
    if (count === 1) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '8px',
      };
    }
  
    if (count === 2) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
      };
    }
  
    if (count === 3) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridAutoRows: 'auto',
        gap: '8px',
      };
    }
  
    if (count <= 4) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
      };
    }
  
    if (count <= 6) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
      };
    }
  
    if (count <= 9) {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
      };
    }
  
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
    };
  };
  