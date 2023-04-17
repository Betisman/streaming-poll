UPDATE settings
  SET poll_status = 'open', updated_at = CURRENT_TIMESTAMP
  WHERE readable_id = %L:readableId AND poll_status = 'closed';