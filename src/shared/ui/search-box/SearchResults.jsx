import SearchResultItem from './SearchResultItem';
import styles from './Search.module.css';

export default function SearchResults({
  results,
  onSelect,
}) {
  return (
    <div className={styles.results} role="listbox">
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
