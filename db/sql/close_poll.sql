UPDATE settings
  SET poll_status = 'closed', updated_at = CURRENT_TIMESTAMP
  WHERE readable_id = %L:readableId AND poll_status = 'open';