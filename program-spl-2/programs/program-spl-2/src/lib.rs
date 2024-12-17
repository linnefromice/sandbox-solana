use anchor_lang::prelude::*;

pub mod instructions;

use instructions::*;

declare_id!("DqQyM9cNFC48XKtkGHvAV5VAWCPLqrM2ZDukGn8RedhX");

#[program]
pub mod program_spl_2 {
    use super::*;

    pub fn init(ctx: Context<Initialize>) -> Result<()> {
        initialize::execute(ctx)
    }
}
