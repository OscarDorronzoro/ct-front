import SearchResultItem from './SearchResultItem';

export default function SearchResults({
  results,
  onSelect,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 48,
        left: 0,
        right: 0,

        background: '#ffffff',

        borderRadius: 12,

        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',

        overflow: 'hidden',

        zIndex: 1,

        padding: '4px 0',
      }}
    >
      {results.map((result, index) => (
        <SearchResultItem
          key={`${result.type}-${result.id}-${index}`}
          result={result}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
