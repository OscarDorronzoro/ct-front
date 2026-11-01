import { FormField, SelectField, formStyles } from '@/shared/ui/form';
import { COLLAR_PARAM_GROUPS, formatParamValue } from '@/entities/command';
import styles from './ParamsFields.module.css';

const toggleOptions = [
  { value: '', label: 'Sin cambios' },
  { value: 1, label: 'Activado' },
  { value: 0, label: 'Desactivado' },
];

function ParamField({
  param, value, current, onChange,
}) {
  const { name, label } = param;
  const reference = current === undefined
    ? `De fábrica: ${formatParamValue(param, param.factory)}`
    : `Ahora: ${formatParamValue(param, current)}`;
  const handleChange = (e) => onChange(name, e.target.value);

  if (param.kind === 'toggle') {
    return (
      <SelectField
        label={label}
        name={name}
        value={value ?? ''}
        onChange={handleChange}
        options={toggleOptions}
        hint={reference}
      />
    );
  }

  if (param.kind === 'time') {
    return (
      <FormField
        label={label}
        name={name}
        type="time"
        value={value ?? ''}
        onChange={handleChange}
        hint={reference}
      />
    );
  }

  return (
    <FormField
      label={label}
      name={name}
      type="number"
      inputMode="numeric"
      min={param.min}
      max={param.max}
      step={1}
      value={value ?? ''}
      onChange={handleChange}
      hint={`${reference}. De ${param.min} a ${param.max}`}
    />
  );
}

// values: { [name]: what was typed }. current: params of the collar, when there is only one
export default function ParamsFields({ values, current, onChange }) {
  return (
    <>
      <p className={formStyles.hint}>Complete solo lo que quiere cambiar.</p>

      {COLLAR_PARAM_GROUPS.map((group) => (
        <fieldset key={group.title} className={styles.group}>
          <legend className={styles.title}>{group.title}</legend>

          <div className={formStyles.row}>
            {group.params.map((param) => (
              <ParamField
                key={param.name}
                param={param}
                value={values[param.name]}
                current={current?.[param.name]}
                onChange={onChange}
              />
            ))}
          </div>
        </fieldset>
      ))}
    </>
  );
}
