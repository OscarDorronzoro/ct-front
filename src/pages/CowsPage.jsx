import { useEffect, useState } from 'react';

import CowList from '../components/cows/CowList';
import Toolbar from '../components/utils/Toolbar';

import { getAllCows } from '../services/api'
import SearchBox from '../components/utils/SearchBox';

export default function CowsPage() {
  const [cows, setCows] = useState(null);
  const [selectedCow, setSelectedCow] = useState(null);
  const [search, setSearch] = useState(null);

  useEffect(() => {
    getAllCows()
      .then(setCows);
  }, []);

return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}>

        {/* Header */}
        <div style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: '#ffffff',
          borderBottom: '1px solid #ddd',
          gap: '12px',
        }}>
          <div style={{
            fontWeight: 'bold',
            color: '#5e3b2c',
            margin: '0 auto',
            fontSize: 18,
          }}>
            <h2>Vacas</h2>
          </div>

        </div>

        {/* Content */}
        <div style={{
          marginTop: '10px',
          background: '#fff',
          height: '100%',
          flex: 1,
          padding: 16,
          overflow: 'auto',
        }}>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder={'Buscar vaca...'}
          />
          <Toolbar
            label={'Agregar vaca'}
            onAdd={null}
          />
          <CowList
            cows={cows}
            selectedCow={selectedCow}
            onSelect={setSelectedCow}
          />
        </div>
      </div>
);
}
