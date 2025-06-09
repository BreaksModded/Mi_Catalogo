import React from "react";
import { MdInfo } from "react-icons/md";
import "./DatabaseSleepNotice.css";

export default function DatabaseSleepNotice({ visible }) {
  if (!visible) return null;
  return (
    <div className="db-sleep-notice">
      <MdInfo size={24} color="#e6a700" style={{ marginRight: 8 }} />
      <div>
        <strong>Base de datos en modo reposo</strong>
        <div style={{ fontSize: 14 }}>
          La base de datos en Supabase está en modo reposo (sleep). Este es un comportamiento normal en el plan gratuito. Puede tardar hasta 30-60 segundos en despertar la primera vez que se usa después de un periodo de inactividad.
        </div>
      </div>
    </div>
  );
}
